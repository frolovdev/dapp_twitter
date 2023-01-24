import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Program, ProgramAccount } from '@project-serum/anchor';
import { IDL } from '../constants/idl';
import { GetProgramAccountsFilter, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { PROGRAM_PUBKEY } from '../constants/keys';
import { Cryptotwitter } from '../constants/idl';
import {
  MutationOptions,
  QueryFunctionContext,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import base58 from 'bs58';
import { BN } from 'bn.js';
import { useInView } from 'react-intersection-observer';

export function useWorkspace() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions(),
      );
      return new anchor.Program(
        IDL,
        PROGRAM_PUBKEY,
        provider,
      ) as Program<Cryptotwitter>;
    }
  }, [connection, anchorWallet]);

  return { program, connection, wallet: anchorWallet };
}

export type Accounts = anchor.IdlAccounts<Cryptotwitter>;
export type TweetAccount = Accounts['tweet'];

const getPagePublicKeys = (
  page: number,
  perPage: number,
  allPublicKeys: PublicKey[],
) => {
  return allPublicKeys.slice((page - 1) * perPage, page * perPage);
};

type UseTweetsQueryKey = ['tweets', GetProgramAccountsFilter[], any[]];

export function useTweets(filters: GetProgramAccountsFilter[], enabled: boolean = true) {
  const { program, connection } = useWorkspace();
  const { publicKey } = useWallet();
  const page = useRef(1);

  const { ref, inView } = useInView();
  const perPage = 12;

  const { data: allTweetPublicKeys, status } = useQuery({
    queryKey: ['tweetPublicKeys', filters],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!program) {
        throw new Error();
      }

      // Prepare the discriminator filter.
      const tweetClient = program.account.tweet;

      // @ts-expect-error not available right now
      const tweetAccountName = tweetClient._idlAccount.name;
      const tweetDiscriminatorFilter = {
        memcmp: tweetClient.coder.accounts.memcmp(tweetAccountName),
      };

      // Prefetch all tweets with their timestamps only.
      const allTweets = await connection.getProgramAccounts(program.programId, {
        filters: [tweetDiscriminatorFilter, ...filters],
        dataSlice: { offset: 40, length: 8 },
      });

      // Parse the timestamp from the account's data.
      const allTweetsWithTimestamps = allTweets.map(({ account, pubkey }) => ({
        pubkey,
        timestamp: new BN(account.data, 'le'),
      }));

      const sorted = allTweetsWithTimestamps.sort((a, b) =>
        b.timestamp.sub(a.timestamp).toNumber(),
      );

      return sorted.map(({ pubkey }) => pubkey);
    },
    enabled: Boolean(program && enabled),
  });

  const query = useInfiniteQuery<
    ProgramAccount<TweetAccount>[],
    unknown,
    ProgramAccount<TweetAccount>[],
    UseTweetsQueryKey
  >({
    queryKey: ['tweets', filters, allTweetPublicKeys || []],
    getNextPageParam: (lastPage, pages) => {
      if (!allTweetPublicKeys) {
        throw new Error();
      }

      if (pages.flat().length === allTweetPublicKeys.length) {
        return undefined;
      }

      const pagePublicKeys = allTweetPublicKeys.slice(
        (page.current - 1) * perPage,
        page.current * perPage,
      );

      return pagePublicKeys;
    },
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<UseTweetsQueryKey, PublicKey[]>) => {
      if (
        !publicKey ||
        !program ||
        !allTweetPublicKeys ||
        allTweetPublicKeys.length <= 0
      ) {
        throw new Error();
      }

      const defaultPageParam =
        pageParam ||
        allTweetPublicKeys.slice(
          (page.current - 1) * perPage,
          page.current * perPage,
        );

      const tweets = (await program.account.tweet.fetchMultiple(
        defaultPageParam,
      )) as TweetAccount[];

      const tweetsWithPublicKeys = defaultPageParam.map((pk, i) => ({
        account: tweets[i],
        publicKey: pk,
      }));

      page.current += 1;

      return tweetsWithPublicKeys.filter((tw) => Boolean(tw.account));
    },
    refetchOnWindowFocus: false,
    enabled: Boolean(
      program && publicKey && Number(allTweetPublicKeys?.length) > 0 && enabled,
    ),
  });

  useEffect(() => {
    const fn = async () => {
      if (inView && status === 'success' && query.hasNextPage) {
        await query.fetchNextPage();
      }
    };

    fn();
  }, [page, status, query.hasNextPage, inView]);

  return { ...query, ref };
}

export function useTweetQuery(tweetPublicKey: PublicKey) {
  const { program } = useWorkspace();

  const query = useQuery({
    queryKey: ['tweet', tweetPublicKey],
    queryFn: async () => {
      if (!program) {
        throw new Error();
      }

      const tweetAccount = await program?.account.tweet.fetch(tweetPublicKey);

      return tweetAccount;
    },
    enabled: Boolean(program),
  });

  return query;
}

export const authorFilter = (
  authorBase58PublicKey: string,
): GetProgramAccountsFilter => ({
  memcmp: {
    offset: 8, // Discriminator.
    bytes: authorBase58PublicKey,
  },
});

export const topicFilter = (topic: string): GetProgramAccountsFilter => ({
  memcmp: {
    offset:
      8 + // Discriminator.
      32 + // Author public key.
      8 + // Timestamp.
      4, // Topic string prefix.
    bytes: base58.encode(Buffer.from(topic)),
  },
});

type UseTweetMutationVariables = {
  topic: string;
  content: string;
};

export const useTweetMutation = (
  options?: MutationOptions<unknown, unknown, UseTweetMutationVariables>,
) => {
  const { program } = useWorkspace();
  const { publicKey } = useWallet();
  const mutation = useMutation<unknown, unknown, UseTweetMutationVariables>({
    ...options,
    mutationFn: async ({ topic, content }) => {
      if (!publicKey || !program) {
        return;
      }

      const tweet = anchor.web3.Keypair.generate();
      const result = await program.methods
        .sendTweet(topic, content)
        .accounts({
          author: publicKey,
          tweet: tweet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweet])
        .rpc();

      return result;
    },
  });

  return mutation;
};

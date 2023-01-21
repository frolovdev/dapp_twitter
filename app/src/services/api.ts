import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { Program } from '@project-serum/anchor';
import { IDL } from '../constants/idl';
import {
  clusterApiUrl,
  Connection,
  GetProgramAccountsFilter,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { PROGRAM_PUBKEY } from '../constants/keys';
import { Cryptotwitter } from '../constants/idl';
import { MutationOptions, useMutation, useQuery } from '@tanstack/react-query';
import { PAYMENT_LINK_STATE, USER_STATE } from '../constants/seeds';
import { BN, type BN as BNType } from 'bn.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { getMint } from '@solana/spl-token';
import { usdcAddress } from '../shared';
import BigNumber from 'bignumber.js';
import base58 from 'bs58';

export function useProgram() {
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

  return program;
}

export function useTweets(filters: GetProgramAccountsFilter[]) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const query = useQuery({
    queryKey: ['tweets', filters],
    queryFn: async () => {
      if (!publicKey || !program) {
        throw new Error();
      }

      const tweets = await program?.account.tweet.all(filters);

      return tweets;
    },
    select: (data) =>
      [...data].sort((a, b) =>
        a.account.timestamp.sub(b.account.timestamp).toNumber(),
      ),
    enabled: Boolean(program && publicKey),
  });

  return query;
}

export function useTweetQuery(tweetPublicKey: string) {
  const program = useProgram();

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

export const authorFilter = (authorBase58PublicKey: string) => ({
  memcmp: {
      offset: 8, // Discriminator.
      bytes: authorBase58PublicKey,
  }
})

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

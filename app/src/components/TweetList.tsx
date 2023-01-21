import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { topicFilter, TweetAccount, useTweets } from '../services/api';
import { TweetCard } from './TweetCard';

export function TweetList({
  list,
  notFoundMessage,
}: {
  list: { account: TweetAccount; publicKey: PublicKey }[];
  notFoundMessage: string;
}) {
  if (list.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">{notFoundMessage}</div>
    );
  }

  return (
    <>
      {list.map((tw, i) => (
        <TweetCard
          publicKey={tw.publicKey.toBase58()}
          key={i}
          author={tw.account.author.toBase58()}
          topic={tw.account.topic}
          content={tw.account.content}
          timestamp={tw.account.timestamp.toNumber()}
        />
      ))}
    </>
  );
}

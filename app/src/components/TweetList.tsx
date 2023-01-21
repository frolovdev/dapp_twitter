import { useWallet } from '@solana/wallet-adapter-react';
import { topicFilter, useTweets } from '../services/api';
import { TweetCard } from './TweetCard';

export function TweetList({
  topic,
  notFoundMessage,
}: {
  topic?: string;
  notFoundMessage: string;
}) {
  const { publicKey } = useWallet();
  const { data, status } = useTweets(topic ? [topicFilter(topic)] : []);

  if (!publicKey) {
    return null;
  }

  if (status !== 'success') {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">{notFoundMessage}</div>
    );
  }

  return (
    <>
      {data.map((tw, i) => (
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

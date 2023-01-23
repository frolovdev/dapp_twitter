import { Link } from './Link';
import { DateTime } from 'luxon';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

export const TweetCard = (tweet: {
  author: string;
  topic?: string;
  content: string;
  timestamp: number;
  publicKey: string;
}) => {
  const { publicKey } = useWallet();
  const authorRoute = useMemo(() => {
    if (publicKey && publicKey.toBase58() === tweet.author) {
      return `/profile`;
    } else {
      return `/users/${tweet.author}`;
    }
  }, [publicKey, tweet.author]);

  return (
    <div className="px-8 py-4">
      <div>
        <h3 className="inline font-semibold" title={tweet.author}>
          <Link href={authorRoute} className="hover:underline">
            {tweet.author.slice(0, 4) + '..' + tweet.author.slice(-4)}
          </Link>
        </h3>
        <span className="text-gray-500"> • </span>
        <time className="text-sm text-gray-500" title="tweet.created_at">
          <Link href={`/tweets/${tweet.publicKey}`} className="hover:underline">
            {DateTime.fromSeconds(tweet.timestamp).toRelative()}
          </Link>
        </time>
      </div>
      <p className="whitespace-pre-wrap">{tweet.content}</p>

      {tweet.topic && (
        <Link
          href={`/topics/${tweet.topic}`}
          className="mt-2 inline-block text-pink-500 hover:underline"
        >
          #{tweet.topic}
        </Link>
      )}
    </div>
  );
};

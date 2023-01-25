import { Link } from './Link';
import { DateTime } from 'luxon';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo, useState } from 'react';
import { TweetFormUpdate } from './TweetFormUpdate';
import { ProgramAccount } from '@project-serum/anchor';
import { TweetAccount } from '../services/api';

export const TweetCard = ({
  tweet,
}: {
  tweet: ProgramAccount<TweetAccount>;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const { publicKey } = useWallet();

  const isMyTweet =
    publicKey && publicKey.toBase58() === tweet.account.author.toBase58();
  const authorRoute = useMemo(() => {
    if (publicKey && publicKey.toBase58() === tweet.account.author.toBase58()) {
      return `/profile`;
    } else {
      return `/users/${tweet.account.author.toBase58()}`;
    }
  }, [publicKey, tweet.account.author]);

  function handleDelete() {}
  function handleClose() {
    setIsEditing(false);
  }

  return (
    <>
      {isEditing && (
        <TweetFormUpdate onClose={handleClose} tweet={tweet}></TweetFormUpdate>
      )}
      <div className="px-8 py-4">
        <div>
          <div className="flex justify-between">
            <div className="py-1">
              <h3
                className="inline font-semibold"
                title={tweet.account.author.toBase58()}
              >
                <Link href={authorRoute} className="hover:underline">
                  {tweet.account.author.toBase58().slice(0, 4) +
                    '..' +
                    tweet.account.author.toBase58().slice(-4)}
                </Link>
              </h3>
              <span className="text-gray-500"> • </span>
              <time
                className="text-sm text-gray-500"
                title={DateTime.fromSeconds(
                  tweet.account.timestamp.toNumber(),
                ).toFormat('lll')}
              >
                <Link
                  href={`/tweets/${tweet.publicKey}`}
                  className="hover:underline"
                >
                  {DateTime.fromSeconds(
                    tweet.account.timestamp.toNumber(),
                  ).toRelative()}
                </Link>
              </time>
            </div>
            {isMyTweet && (
              <div className="flex">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex rounded-full px-2 text-gray-500 hover:bg-gray-100 hover:text-pink-500"
                  title="Update tweet"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="m-auto h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path
                      fillRule="evenodd"
                      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex rounded-full px-2 text-gray-500 hover:bg-gray-100 hover:text-pink-500"
                  title="Delete tweet"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="m-auto h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="whitespace-pre-wrap">{tweet.account.content}</p>

        {tweet.account.topic && (
          <Link
            href={`/topics/${tweet.account.topic}`}
            className="mt-2 inline-block text-pink-500 hover:underline"
          >
            #{tweet.account.topic}
          </Link>
        )}
      </div>
    </>
  );
};

import { ProgramAccount } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { DateTime } from 'luxon';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { TweetAccount } from '../services/api';
import { useAutoresizeTextarea } from '../services/useAutosizeTextArea';
import { useCountCharacterLimit } from '../services/useCountCharacterLimit';
import { useSlug } from '../services/useSlug';
import { Link } from './Link';

export const TweetFormUpdate = ({
  tweet,
  onClose,
}: {
  onClose: () => void;
  tweet: ProgramAccount<TweetAccount>;
}) => {
  const { connected } = useWallet();

  const [content, setContent] = useState(tweet.account.content);
  const [topic, setTopic] = useState(tweet.account.topic);
  const slugTopic = useSlug(topic);

  const characterLimit = useCountCharacterLimit(content, 280);
  const characterLimitColor = useMemo(() => {
    if (characterLimit < 0) return 'text-red-500';
    if (characterLimit <= 10) return 'text-yellow-500';
    return 'text-gray-400';
  }, [characterLimit]);

  const canTweet = useMemo(
    () => Boolean(content && characterLimit >= 0),
    [content, characterLimit],
  );

  const textarea = useRef<HTMLTextAreaElement>(null);
  useAutoresizeTextarea(textarea);

  function handleUpdate() {}

  function handleClose() {
    onClose();
  }

  function handleChangeContent(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
  }
  function handleChangeTopic(event: ChangeEvent<HTMLInputElement>) {
    setTopic(event.target.value);
  }
  if (connected) {
    return (
      <div>
        <div className="border-l-4 border-pink-500 px-8 py-4">
          <div className="py-1">
            <h3
              className="inline font-semibold"
              title={tweet.account.author.toBase58()}
            >
              <Link href="/profile" className="hover:underline">
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

          <textarea
            ref={textarea}
            rows={1}
            className="mb-3 w-full resize-none text-xl focus:outline-none"
            placeholder="What's happening?"
            onChange={handleChangeContent}
            value={content}
          ></textarea>

          <div className="-m-2 flex flex-wrap items-center justify-between">
            <div className="relative m-2 mr-4">
              <input
                type="text"
                placeholder="topic"
                className="rounded-full bg-gray-100 py-2 pl-10 pr-4 text-pink-500"
                value={slugTopic}
                onChange={handleChangeTopic}
              />
              <div className="absolute inset-y-0 left-0 flex pl-3 pr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`m-auto h-5 w-5 ${
                    slugTopic ? 'text-pink-500' : 'text-gray-400'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="m-2 ml-auto flex items-center space-x-4">
              <div className={characterLimitColor}>{characterLimit} left</div>

              <button
                className="rounded-full border bg-white px-4 py-2 text-gray-500 hover:bg-gray-50"
                onClick={handleClose}
              >
                Cancel
              </button>

              <button
                className={`rounded-full px-4 py-2 font-semibold text-white ${
                  canTweet ? 'bg-pink-500' : 'cursor-not-allowed bg-pink-300'
                }`}
                disabled={canTweet}
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-gray-50 px-8 py-4 text-center text-gray-500">
      Connect your wallet to start tweeting...
    </div>
  );
};

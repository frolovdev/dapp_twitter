import { ReactElement, useState } from 'react';
import { Layout } from '../../components/Layout';
import { TweetSearch } from '../../components/TweetSearch';
import { useSlug } from '../../services/useSlug';
import { TweetList } from '../../components/TweetList';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { TweetForm } from '../../components/TweetForm';

export default function Topics() {
  const router = useRouter();

  const [topic, setTopic] = useState((router.query.slug?.[0] || '') as string);
  const [viewedTopic, setViewedTopic] = useState('');
  const slugTopic = useSlug(topic);

  const { publicKey } = useWallet();

  function handleSearch() {
    setViewedTopic(slugTopic);
    router.push(`/topics/${slugTopic}`);
  }

  return (
    <>
      <TweetSearch
        onChange={(event: any) => setTopic(event.target.value)}
        onSearch={handleSearch}
        disabled={!slugTopic}
        value={slugTopic}
        placeholder="topic"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z"
              clipRule="evenodd"
            />
          </svg>
        }
      />
      {viewedTopic && (
        <>
          <TweetForm forcedTopic={viewedTopic} />
          <TweetList
            notFoundMessage="No tweets were found in this topic..."
            topic={slugTopic}
          />
        </>
      )}
    </>
  );
}

Topics.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

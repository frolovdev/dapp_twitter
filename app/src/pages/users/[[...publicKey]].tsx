import { useWallet } from '@solana/wallet-adapter-react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';
import { Layout } from '../../components/Layout';
import { TweetList } from '../../components/TweetList';
import { TweetSearch } from '../../components/TweetSearch';
import { authorFilter, useTweets } from '../../services/api';

export default function Users() {
  const router = useRouter();

  const [author, setAuthor] = useState(
   () => (router.query.publicKey?.[0] || '') as string,
  );

  const [viewedAuthor, setViewedAuthor] = useState(() => author);

  const { publicKey } = useWallet();
  const { data: list, status } = useTweets(
    viewedAuthor ? [authorFilter(viewedAuthor)] : [],
  );

  function handleSearch() {
    setViewedAuthor(author);
    router.push(`/users/${author}`);
  }

  return (
    <>
      <TweetSearch
        onChange={(event: any) => setAuthor(event.target.value)}
        onSearch={handleSearch}
        disabled={!author}
        value={author}
        placeholder="public key"
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
      {viewedAuthor && (
        <>
          {!publicKey && (
            <div className="border-b bg-gray-50 px-8 py-4 text-center text-gray-500">
              Connect your wallet to start tweeting...
            </div>
          )}
          {publicKey && status === 'loading' && (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          )}
          {publicKey && status === 'success' && (
            <TweetList
              list={list}
              notFoundMessage="No tweets were found in this topic..."
            />
          )}
        </>
      )}
    </>
  );
}

Users.getInitialProps = async (context: NextPageContext) => {
  return {};
};


Users.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

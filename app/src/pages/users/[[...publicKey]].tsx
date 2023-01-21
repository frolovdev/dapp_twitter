import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';
import { Layout } from '../../components/Layout';
import { TweetList } from '../../components/TweetList';
import { TweetSearch } from '../../components/TweetSearch';

export default function Users() {
  const router = useRouter();

  const [author, setAuthor] = useState(
    (router.query.publicKey?.[0] || '') as string,
  );
  const [viewedAuthor, setViewedAuthor] = useState('');

  const { publicKey } = useWallet();

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
        <TweetList
          notFoundMessage="No tweets were found in this topic..."
          topic={author}
        />
      )}
    </>
  );
}

Users.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
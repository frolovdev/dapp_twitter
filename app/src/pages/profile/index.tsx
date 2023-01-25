import { useWallet } from '@solana/wallet-adapter-react';
import { ReactElement } from 'react';
import { Layout } from '../../components/Layout';
import { TweetForm } from '../../components/TweetForm';
import { TweetList } from '../../components/TweetList';
import { authorFilter, useTweets } from '../../services/api';

export default function Profile() {
  const { publicKey } = useWallet();

  const {
    data: list,
    status,
    ref,
    fetchNextPage,
    hasNextPage,
  } = useTweets(publicKey ? [authorFilter(publicKey.toBase58())] : []);
  return (
    <>
      <div className="border-b bg-gray-50 px-8 py-4">
        {publicKey
          ? publicKey.toBase58().slice(0, 8) +
            '..' +
            publicKey.toBase58().slice(-4)
          : 'please connect your wallet'}
      </div>
      {publicKey && (
        <>
          <TweetForm></TweetForm>
          {status === 'loading' && (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          )}

          {status === 'success' && (
            <TweetList
              onLoadMore={fetchNextPage}
              ref={ref}
              hasMore={Boolean(hasNextPage)}
              list={list}
              notFoundMessage="no tweets..."
            />
          )}
        </>
      )}
    </>
  );
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

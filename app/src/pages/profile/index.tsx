import { useWallet } from '@solana/wallet-adapter-react';
import { ReactElement } from 'react';
import { Layout } from '../../components/Layout';
import { TweetForm } from '../../components/TweetForm';
import { TweetList } from '../../components/TweetList';

export default function Profile() {
  const { publicKey } = useWallet();
  return (
    <>
      <div className="border-b bg-gray-50 px-8 py-4">
        {publicKey?.toBase58()}
      </div>
      <TweetForm></TweetForm>
      <TweetList notFoundMessage='no tweets...'></TweetList>
    </>
  );
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

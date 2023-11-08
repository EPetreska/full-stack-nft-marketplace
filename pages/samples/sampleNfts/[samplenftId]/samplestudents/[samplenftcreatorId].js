import { useRouter } from 'next/router';
import sampleNFTs from '../../../../../sampleNfts.json';

export default function SampleSTUDENT() {
  const router = useRouter();
  const { samplenftId, samplenftcreatorId } = router.query;

  const samplenft = sampleNFTs.sampleNfts.find((samplenft) => samplenft.id === samplenftId);

  if (!samplenft) {
    return <div>Item not found</div>;
  }

  const samplestudent = sampleNFTs.sampleNfts.find((samplestudent) => samplenft.samplestudents.id === samplenftcreatorId);

  if (!samplestudent) {
    return <div>Student not found</div>;
  }

  return (
    <div className="container border shadow rounded-xl overflow-visible">
        <img style={{height: '400px', width: 'auto'}} class="object-cover" src={samplenft.samplestudents.creatorImage} />
          <div style={{ height: '70px' }}>
            <h1 className="text-2xl py-5 font-bold text-">{samplenft.samplestudents.creatorName}</h1>
              <p style={{ height: '200px' }} className="py-4 text-black">
                {samplenft.samplestudents.creatorCV} 
              </p>
          </div>
    </div>
  );
};  
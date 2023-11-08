import { useRouter } from 'next/router';
import sampleNFTs from '../../sampleNfts.json';

export default function SampleNFT () {
  const router = useRouter();
  const { samplenftId } = router.query;

  const samplenft = sampleNFTs.sampleNfts.find((samplenft) => samplenft.id === samplenftId);

  if (!samplenft) {
    return <div>Item not found</div>;
  }

  return (
      <div className="container border shadow rounded-xl overflow-hidden">
        <div style={{ position: 'relative' }}>
          <img style={{height: 'auto', width: '2500px'}} class="object-cover" src={samplenft.image} />
            <div
              style={{
                height: 'auto',
                width: '310px',
                position: 'absolute',
                top: '75%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'black',
                opacity: '0.7',
                padding: '5px',
                color: 'white',
                borderRadius: '5px',
              }}>
              <div className="text-2xl text-sky-500 font-bold">
                {samplenft.name}
              </div>
              <div className="mt-5 text-sm text-white font-bold">
                {samplenft.description}
              </div>
              <div className="mt-2 text-xl text-sky-700 font-bold">
                {samplenft.samplestudents.creatorName}
              </div>
            </div>
        </div>
        <div style={{ height: '70px' }}>
          <h1 className="text-2xl py-5 font-bold text-">{samplenft.name}</h1>
            <p className="py-4 text-cyan-600"> {samplenft.description} </p>
            <p className="text-black"> {samplenft.longdescription} </p>
        </div>
      </div>
  );
};  
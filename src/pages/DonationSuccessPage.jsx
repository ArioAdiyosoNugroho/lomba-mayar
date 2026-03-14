import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { TreePine, CheckCircle, Loader } from 'lucide-react';

export default function DonationSuccessPage() {
  const [params] = useSearchParams();
  const donationId = params.get('donation_id');
  const [donation, setDonation] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [retries, setRetries]   = useState(0);

  useEffect(() => {
    if (!donationId) { setLoading(false); return; }

    const fetchDonation = async () => {
      try {
        const res = await api.get(`/donations/${donationId}?allow_public=1`);
        setDonation(res.data);

        // If still pending, poll up to 5 times (webhook may be delayed)
        if (res.data.status === 'pending' && retries < 5) {
          setTimeout(() => setRetries(r => r + 1), 3000);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [donationId, retries]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader size={40} className="animate-spin text-green-400" />
      <p className="text-gray-400">Memverifikasi pembayaran...</p>
      {retries > 0 && <p className="text-gray-500 text-sm">Mencoba ke-{retries}/5...</p>}
    </div>
  );

  const isPaid = donation?.status === 'paid';

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${isPaid ? 'bg-green-900/40' : 'bg-gray-800'}`}>
        {isPaid ? <CheckCircle size={48} className="text-green-400" /> : <TreePine size={48} className="text-gray-400" />}
      </div>

      <h1 className="text-3xl font-bold text-white">
        {isPaid ? 'Terima Kasih! 🌿' : 'Pembayaran Sedang Diproses'}
      </h1>

      {donation && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={`font-semibold capitalize ${isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
              {isPaid ? '✅ Lunas' : '⏳ ' + donation.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Jumlah Donasi</span>
            <span className="text-white font-semibold">{donation.amount_formatted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pohon Ditanam</span>
            <span className="text-green-400 font-bold text-lg">{donation.trees_count} 🌱</span>
          </div>
          {donation.donor_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Atas Nama</span>
              <span className="text-white">{donation.donor_name}</span>
            </div>
          )}
          {donation.donor_message && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-gray-400 text-xs mb-1">Pesanmu</p>
              <p className="text-gray-300 text-sm italic">"{donation.donor_message}"</p>
            </div>
          )}
        </div>
      )}

      {isPaid && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-5">
          <p className="text-green-300 font-medium">
            🌳 {donation.trees_count} pohon akan ditanam di lahan terdeforestasi Indonesia atas namamu!
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/leaderboard" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          Lihat Leaderboard
        </Link>
        <Link to="/map" className="border border-gray-700 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-xl font-medium transition-colors">
          Lihat Peta
        </Link>
      </div>
    </div>
  );
}

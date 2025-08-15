import { getAllmostViewedPhones } from '@/services/products/phoneService';
import ClientHomePage from './ClientHomePage';
import { getAllTablets } from '@/services/products/tabletService';
import { getAllMacbook } from '@/services/products/macbookService';
import { getAllWindows } from '@/services/products/windowsService';
import { getAllNews, getAllTipsAndTricks } from '@/services/postService';

export default async function Home() {
  const mostViewedPhones = await getAllmostViewedPhones();
  const tablets = await getAllTablets();
  const macbook = await getAllMacbook();
  const windows = await getAllWindows();
  const news = await getAllNews();
  const tricks = await getAllTipsAndTricks();

  return (
    <>
      <ClientHomePage mostViewedPhones={mostViewedPhones} tablets={tablets} macbook={macbook} windows={windows} news={news} tricks={tricks} />
    </>
  );
}

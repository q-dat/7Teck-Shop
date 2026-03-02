import { getAllmostViewedPhones } from '@/services/products/phoneService';
import ClientHomePage from './ClientHomePage';
import { getAllNews, getAllTipsAndTricks } from '@/services/postService';
import { getAllUsedMacbook } from '@/services/products/macbookService';
import { getAllUsedTablets } from '@/services/products/tabletService';
import { getAllUsedWindows } from '@/services/products/windowsService';

export default async function Home() {
  const mostViewedPhones = await getAllmostViewedPhones();
  const tablets = await getAllUsedTablets();
  const macbook = await getAllUsedMacbook();
  const windows = await getAllUsedWindows();
  const news = await getAllNews();
  const tricks = await getAllTipsAndTricks();

  return (
    <>
      <ClientHomePage mostViewedPhones={mostViewedPhones} tablets={tablets} macbook={macbook} windows={windows} news={news} tricks={tricks} />
    </>
  );
}

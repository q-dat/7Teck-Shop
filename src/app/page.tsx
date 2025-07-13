import { getAllmostViewedPhones } from '@/services/products/phoneService';
import ClientHomePage from './ClientHomePage';
import { getAllNewTablets } from '@/services/products/tabletService';
import { getAllNewMacbook } from '@/services/products/macbookService';
import { getAllNewWindows } from '@/services/products/windowsService';
import { getAllPosts } from '@/services/postService';

export default async function Home() {
  const mostViewedPhones = await getAllmostViewedPhones();
  const tablets = await getAllNewTablets();
  const macbook = await getAllNewMacbook();
  const windows = await getAllNewWindows();
  const posts = await getAllPosts();

  return (
    <>
      <ClientHomePage mostViewedPhones={mostViewedPhones} tablets={tablets} macbook={macbook} windows={windows} posts={posts} />
    </>
  );
}

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function LegacySlugPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/es/${slug.join('/')}`);
}

'use client';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Domain } from '@/lib/projectMeta';

const ProjectScene = dynamic(() => import('@/components/three/ProjectScene'), { ssr: false });

export default function ProjectSceneSlot({ slug, domain, className }: { slug: string; domain: Domain; className?: string }) {
  const still = useReducedMotion();
  return <ProjectScene slug={slug} domain={domain} still={still} className={className} />;
}

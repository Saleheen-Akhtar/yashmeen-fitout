'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

export interface ZoomParallaxImage {
	src: string;
	alt?: string;
	fallbackSrc?: string;
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: ZoomParallaxImage[];
	/** Optional click handler when a tile is clicked */
	onImageClick?: (index: number, image: ZoomParallaxImage) => void;
}

export function ZoomParallax({ images, onImageClick }: ZoomParallaxProps) {
	const container = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];
	const visibleImages = images.slice(0, 7);

	return (
		<div ref={container} className="relative h-[300vh]">
			<div className="sticky top-0 h-screen overflow-hidden">
				{visibleImages.map((image, index) => {
					const { src, alt, fallbackSrc } = image;
					const scale = scales[index % scales.length];

					return (
						<motion.div
							key={index}
							style={{ scale }}
							className={`pointer-events-none absolute top-0 flex h-full w-full items-center justify-center will-change-transform ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
						>
							<div
								role={onImageClick ? 'button' : undefined}
								tabIndex={onImageClick ? 0 : undefined}
								aria-label={onImageClick ? `Inspect ${alt || `Parallax image ${index + 1}`}` : undefined}
								onClick={onImageClick ? () => onImageClick(index, image) : undefined}
								onKeyDown={
									onImageClick
										? (e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													onImageClick(index, image);
												}
											}
										: undefined
								}
								className={`pointer-events-auto relative h-[25vh] w-[25vw] overflow-hidden rounded-[2px] shadow-[0_18px_48px_-14px_rgba(8,8,7,0.22)] ring-1 ring-black/10 ${onImageClick ? 'cursor-pointer transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-white' : ''}`}
							>
								<img
									src={src || fallbackSrc || '/placeholder.svg'}
									alt={alt || `Parallax image ${index + 1}`}
									className="h-full w-full object-cover"
									onError={(e) => {
										if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
											e.currentTarget.onerror = null;
											e.currentTarget.src = fallbackSrc;
										}
									}}
								/>
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { animate, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import ImageWithSkeleton from "./ImageWithSkeleton";

interface SwipeCardsProps {
  className?: string;
}

const SwipeCards = ({ className }: SwipeCardsProps) => {
  const [cards, setCards] = useState<Card[]>(cardData);

  const resetCards = () => {
    setCards(cardData);
  };

  return (
    <div
      className={cn(
        "relative grid h-56 w-48 place-items-center",
        className,
      )}
    >
      {cards.length === 0 && (
        <div style={{ gridRow: 1, gridColumn: 1 }} className="z-20">
          <Button onClick={resetCards} variant={"outline"}>
            <RefreshCw className="size-4" />
            Again
          </Button>
        </div>
      )}
      {cards.map((card, index) => {
        const depth = cards.length - 1 - index;
        return (
          <Card
            key={card.id}
            cards={cards}
            setCards={setCards}
            depth={depth}
            {...card}
          />
        );
      })}
    </div>
  );
};

const Card = ({
  id,
  url,
  setCards,
  cards,
  depth,
}: {
  id: number;
  url: string;
  setCards: Dispatch<SetStateAction<Card[]>>;
  cards: Card[];
  depth: number;
}) => {
  const x = useMotionValue(0);

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);

  const isFront = id === cards[cards.length - 1]?.id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      setCards((pv) => pv.filter((v) => v.id !== id));
    } else {
      animate(x, 0, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
    }
  };

  return (
    <motion.div
      className="absolute h-56 w-48 origin-bottom overflow-hidden rounded-lg bg-white hover:cursor-grab active:cursor-grabbing border border-gray-300"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        boxShadow: isFront
          ? "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)"
          : undefined,
      }}
      animate={{
        scale: isFront ? 1 : Math.max(0.85, 0.94 - depth * 0.04),
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{
        left: -150,
        right: 150,
        top: 0,
        bottom: 0,
      }}
      onDragEnd={handleDragEnd}
    >
      <ImageWithSkeleton
        src={url}
        alt={isFront ? "Photo of Arbaz" : ""}
        width={175}
        height={233}
        sizes="175px"
        quality={75}
        draggable={false}
        containerClassName="h-full w-full pointer-events-none"
        className="h-full w-full select-none object-cover"
        fetchPriority={isFront ? "high" : "auto"}
        priority
      />
    </motion.div>
  );
};

export default SwipeCards;

type Card = {
  id: number;
  url: string;
};

const cardData: Card[] = [
  {
    id: 1,
    url: "/images/1.webp",
  },
  {
    id: 2,
    url: "/images/2.webp",
  },
  {
    id: 3,
    url: "/images/3.webp",
  },
];

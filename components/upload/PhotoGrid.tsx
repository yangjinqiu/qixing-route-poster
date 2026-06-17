'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppContext';
import PhotoSlot from './PhotoSlot';

export default function PhotoGrid() {
  const { dispatch } = useApp();
  const [dragSource, setDragSource] = useState<number>(-1);
  const [dragTarget, setDragTarget] = useState<number>(-1);

  const handleDragStart = (pos: number) => setDragSource(pos);
  const handleDragOver = (pos: number) => setDragTarget(pos);
  const handleDrop = (pos: number) => {
    if (dragSource >= 0 && dragSource !== pos) {
      dispatch({ type: 'SWAP_PHOTOS', from: dragSource, to: pos });
    }
    setDragSource(-1);
    setDragTarget(-1);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }, (_, i) => (
        <PhotoSlot
          key={i}
          position={i}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={dragSource === i}
          isDragOver={dragTarget === i && dragSource !== i}
        />
      ))}
    </div>
  );
}

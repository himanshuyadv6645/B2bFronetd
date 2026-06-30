import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Trash2, Star, StarOff, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productService } from '@/services/product.service';

interface ImageItem {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

interface ImageManagerModalProps {
  open: boolean;
  onClose: () => void;
  targetType: 'product' | 'variant';
  targetId: string;
  targetName: string;
  images: ImageItem[];
  queryKey: string[];
}

export default function ImageManagerModal({
  open,
  onClose,
  targetType,
  targetId,
  targetName,
  images,
  queryKey,
}: ImageManagerModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (targetType === 'product') {
        return productService.uploadProductImage(targetId, file, { is_primary: images.length === 0 });
      }
      return productService.uploadVariantImage(targetId, file, { is_primary: images.length === 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Image uploaded');
    },
    onError: () => {
      toast.error('Upload failed');
    },
    onSettled: () => setUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => {
      if (targetType === 'product') {
        return productService.deleteProductImage(targetId, imageId);
      }
      return productService.deleteVariantImage(targetId, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Image deleted');
    },
    onError: () => {
      toast.error('Delete failed');
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    // Upload sequentially to avoid race conditions
    const queue = Array.from(files);
    const uploadNext = () => {
      if (queue.length === 0) {
        setUploading(false);
        return;
      }
      const file = queue.shift()!;
      uploadMutation.mutate(file, {
        onSettled: () => {
          uploadNext();
        },
      });
    };
    uploadNext();
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Images</h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{targetName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`mx-6 mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Drag & drop images here or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {images.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No images yet. Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((img) => (
                  <div
                    key={img.id}
                    className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${
                      img.is_primary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || 'Product image'}
                      className="w-full h-full object-cover"
                    />
                    {/* Primary badge */}
                    {img.is_primary && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        Primary
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: set primary via API (PATCH)
                        }}
                        className="p-1.5 bg-white rounded-lg hover:bg-gray-100"
                        title={img.is_primary ? 'Primary image' : 'Set as primary'}
                      >
                        {img.is_primary ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this image?')) {
                            deleteMutation.mutate(img.id);
                          }
                        }}
                        className="p-1.5 bg-white rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

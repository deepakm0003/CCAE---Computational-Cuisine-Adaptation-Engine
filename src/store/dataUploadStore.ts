import { create } from 'zustand';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: 'recipes' | 'molecules';
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface UploadSummary {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalSize: number;
  uploadedSize: number;
}

interface DataUploadState {
  files: UploadFile[];
  summary: UploadSummary;
  isUploading: boolean;
  addFile: (file: UploadFile) => void;
  updateFileStatus: (id: string, status: UploadFile['status'], progress?: number, error?: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setUploading: (uploading: boolean) => void;
}

export const useDataUploadStore = create<DataUploadState>((set, get) => ({
  files: [],
  summary: {
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    totalSize: 0,
    uploadedSize: 0,
  },
  isUploading: false,

  addFile: (file) => set((state) => {
    const newFiles = [...state.files, file];
    const newSummary = calculateSummary(newFiles);
    return {
      files: newFiles,
      summary: newSummary,
    };
  }),

  updateFileStatus: (id, status, progress = 0, error) => set((state) => {
    const newFiles = state.files.map(file =>
      file.id === id
        ? { ...file, status, progress, error }
        : file
    );
    const newSummary = calculateSummary(newFiles);
    return {
      files: newFiles,
      summary: newSummary,
    };
  }),

  removeFile: (id) => set((state) => {
    const newFiles = state.files.filter(file => file.id !== id);
    const newSummary = calculateSummary(newFiles);
    return {
      files: newFiles,
      summary: newSummary,
    };
  }),

  clearFiles: () => set({
    files: [],
    summary: {
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      totalSize: 0,
      uploadedSize: 0,
    },
  }),

  setUploading: (isUploading) => set({ isUploading }),
}));

function calculateSummary(files: UploadFile[]): UploadSummary {
  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const failedFiles = files.filter(f => f.status === 'error').length;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const uploadedSize = files
    .filter(f => f.status === 'completed')
    .reduce((sum, f) => sum + f.size, 0);

  return {
    totalFiles,
    completedFiles,
    failedFiles,
    totalSize,
    uploadedSize,
  };
}

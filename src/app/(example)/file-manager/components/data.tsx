// File data interface
export interface FileData {
  id: string;
  name: string;
  size: string;
  type: string;
  modified: string;
  modifiedTime: string;
  starred: boolean;
  shared?: string[];
}

// Mock data
export const mockFiles: FileData[] = [
  {
    id: "1",
    name: "cover-12.jpg",
    size: "2.08 Mb",
    type: "jpg",
    modified: "28 sept. 2025",
    modifiedTime: "12:29 am",
    starred: false,
  },
  {
    id: "2",
    name: "cover-18.jpg",
    size: "1.99 Mb",
    type: "jpg",
    modified: "26 sept. 2025",
    modifiedTime: "11:29 pm",
    starred: true,
  },
  {
    id: "3",
    name: "cover-2.jpg",
    size: "45.78 Mb",
    type: "jpg",
    modified: "19 oct. 2025",
    modifiedTime: "9:29 pm",
    starred: true,
    shared: ["user1", "user2", "user3"],
  },
  {
    id: "4",
    name: "cover-4.jpg",
    size: "9.16 Mb",
    type: "jpg",
    modified: "15 oct. 2025",
    modifiedTime: "5:29 pm",
    starred: true,
  },
  {
    id: "5",
    name: "cover-6.jpg",
    size: "7.63 Mb",
    type: "jpg",
    modified: "14 oct. 2025",
    modifiedTime: "4:29 pm",
    starred: false,
  },
];

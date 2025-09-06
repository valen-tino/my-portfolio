export interface EducationItem {
  id: number;
  title: string;
  institution: string;
  link?: string;
}

export const education: EducationItem[] = [
  {
    id: 1,
    title: 'B.Sc. Computer Science',
    institution: 'University of Example',
    link: 'https://example.com/degree'
  },
  {
    id: 2,
    title: 'React Development Certificate',
    institution: 'Online Course Provider',
    link: 'https://example.com/certificate'
  }
];

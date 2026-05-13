export type HelpCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type HelpTopic = {
  id: string;
  categoryId: string;
  icon: string;
  title: string;
  description: string;
};

export type HelpFaq = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
};

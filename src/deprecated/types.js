
export interface Project {
    title: string;
    desc: string;
    images: string[];
}

export interface PortfolioData {
    coding: Project[];
    hardware: Project[];
    stage: Project[];
}

export type Discipline = keyof PortfolioData;

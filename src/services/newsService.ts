import apiClient from './apiClient';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export const newsService = {
  // 최신 시장 뉴스 가져오기
  getLatestNews: async (): Promise<NewsItem[]> => {
    try {
      const response = await apiClient.get('/news/latest');
      return response.data;
    } catch (error) {
      console.warn('Using mock data for news');
      return [
        {
          id: '1',
          title: '삼성전자, 반도체 실적 개선 기대감에 상승세',
          summary: '메모리 반도체 가격 회복과 AI 수요 증가로 인해...',
          source: '금융뉴스',
          publishedAt: new Date().toISOString(),
          sentiment: 'positive',
        },
        {
          id: '2',
          title: '미국 연준, 금리 동결 결정... 향후 인하 시점은?',
          summary: '연방공개시장위원회(FOMC)는 정례회의에서 금리를...',
          source: '글로벌경제',
          publishedAt: new Date().toISOString(),
          sentiment: 'neutral',
        },
      ];
    }
  },
};

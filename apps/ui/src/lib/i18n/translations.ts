export type Language = 'en' | 'zh'

export interface Translations {
  nav: {
    myBookings: string
    bucketlist: string
    events: string
    esim: string
    activities: string
    all: string
  }
  categories: {
    all: string
    island: string
    diving: string
    boatTrip: string
    culture: string
    waterSport: string
  }
  explore: {
    experience: string
    discover: string
    loading: string
    addToWishlist: string
  }
  common: {
    price: string
    rating: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      myBookings: 'My Bookings',
      bucketlist: 'Bucketlist',
      events: 'Events',
      esim: 'Esim',
      activities: 'Activities',
      all: 'All',
    },
    categories: {
      all: 'All',
      island: 'Island',
      diving: 'Scuba Dive',
      boatTrip: 'Boat Trip',
      culture: 'Culture',
      waterSport: 'Water Sport',
    },
    explore: {
      experience: 'Experience',
      discover: 'Discover',
      loading: 'Loading experiences...',
      addToWishlist: 'Add to wishlist',
    },
    common: {
      price: 'Price',
      rating: 'Rating',
    },
  },
  zh: {
    nav: {
      myBookings: '我的预订',
      bucketlist: '愿望清单',
      events: '活动',
      esim: '电子SIM卡',
      activities: '活动',
      all: '全部',
    },
    categories: {
      all: '全部',
      island: '岛屿',
      diving: '潜水',
      boatTrip: '乘船旅行',
      culture: '文化',
      waterSport: '水上运动',
    },
    explore: {
      experience: '体验',
      discover: '发现',
      loading: '正在加载体验...',
      addToWishlist: '添加到愿望清单',
    },
    common: {
      price: '价格',
      rating: '评分',
    },
  },
}


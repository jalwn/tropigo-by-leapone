// ActivityCard component for displaying recommended activities

interface ActivityCardProps {
  id: string
  title: string
  description: string
  category: string
  price: number
  island: string
  duration?: string | null
  rating?: number | null
  reviewCount?: string | null
  images: string[]
}

export function ActivityCard({
  title,
  description,
  category,
  price,
  island,
  duration,
  rating,
  reviewCount,
  images,
}: ActivityCardProps) {
  const categoryEmoji: Record<string, string> = {
    'boat-trip': '⛵',
    'diving': '🤿',
    'island': '🏝️',
    'culture': '🎭',
    'water-sport': '🏄',
  }

  return (
    <div className="activity-card">
      {/* Image */}
      <div className="activity-card__image-container">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="activity-card__image"
            loading="lazy"
          />
        ) : (
          <div className="activity-card__image-placeholder">
            <span className="activity-card__emoji">
              {categoryEmoji[category] || '🏝️'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="activity-card__content">
        <h3 className="activity-card__title">{title}</h3>
        <p className="activity-card__description">{description}</p>

        {/* Tags */}
        <div className="activity-card__tags">
          <span className="activity-card__tag activity-card__tag--island">
            {island}
          </span>
          {duration && (
            <span className="activity-card__tag activity-card__tag--duration">
              ⏱️ {duration}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="activity-card__footer">
          <div className="activity-card__price">
            <span className="activity-card__price-currency">$</span>
            <span className="activity-card__price-amount">{price.toFixed(0)}</span>
            <span className="activity-card__price-unit">/person</span>
          </div>

          {rating && (
            <div className="activity-card__rating">
              <span className="activity-card__rating-star">⭐</span>
              <span className="activity-card__rating-value">{rating}</span>
              {reviewCount && (
                <span className="activity-card__rating-count">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .activity-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-bottom: 16px;
        }

        .activity-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .activity-card__image-container {
          width: 100%;
          height: 180px;
          overflow: hidden;
          position: relative;
        }

        .activity-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .activity-card__image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #a5d6a7 0%, #c5e1a5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-card__emoji {
          font-size: 48px;
        }

        .activity-card__content {
          padding: 16px;
        }

        .activity-card__title {
          font-size: 18px;
          font-weight: 600;
          color: #1a3a2e;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .activity-card__description {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .activity-card__tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .activity-card__tag {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .activity-card__tag--island {
          background: #a5d6a7;
          color: #1a3a2e;
        }

        .activity-card__tag--duration {
          background: #f2f2f7;
          color: #666;
        }

        .activity-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-card__price {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .activity-card__price-currency {
          font-size: 16px;
          font-weight: 600;
          color: #1a3a2e;
        }

        .activity-card__price-amount {
          font-size: 24px;
          font-weight: 700;
          color: #1a3a2e;
        }

        .activity-card__price-unit {
          font-size: 12px;
          color: #666;
        }

        .activity-card__rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .activity-card__rating-star {
          font-size: 16px;
        }

        .activity-card__rating-value {
          font-weight: 600;
          color: #1a3a2e;
        }

        .activity-card__rating-count {
          color: #999;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}

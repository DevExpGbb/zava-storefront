import { db } from "@/lib/db";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof db.listProducts>> = [];
  let dbError = false;
  try {
    products = await db.listProducts({ limit: 12 });
  } catch {
    dbError = true;
  }

  return (
    <main>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <span className="hero__eyebrow">New season · Spring 2026</span>
            <h1 className="hero__title">
              Crafted goods for <em>everyday</em> rituals.
            </h1>
            <p className="hero__subtitle">
              Discover small-batch homeware, apparel, and accessories made by
              independent makers — designed to be used, loved, and passed on.
            </p>
            <div className="hero__cta">
              <a href="#featured" className="btn btn--primary">
                Shop the collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </a>
              <a href="/" className="btn btn--ghost">Our story</a>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <div className="hero__visual-tag">
              Made slowly,<br />built to last.
            </div>
          </div>
        </div>
      </section>

      <section className="features" aria-label="Highlights">
        <div className="container features__grid">
          <div className="feature">
            <div className="feature__icon" aria-hidden="true">✦</div>
            <div>
              <p className="feature__title">Small-batch</p>
              <p className="feature__desc">From makers we know by name.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature__icon" aria-hidden="true">↺</div>
            <div>
              <p className="feature__title">Free 30-day returns</p>
              <p className="feature__desc">Take your time deciding.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature__icon" aria-hidden="true">⚑</div>
            <div>
              <p className="feature__title">Carbon-neutral shipping</p>
              <p className="feature__desc">On every order, everywhere.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature__icon" aria-hidden="true">♡</div>
            <div>
              <p className="feature__title">Lifetime repairs</p>
              <p className="feature__desc">We fix what we sell.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <h2 className="section__title">Featured products</h2>
              <p className="section__subtitle">
                A handpicked selection from this season's collection.
              </p>
            </div>
            <a href="/" className="section__link">View all →</a>
          </div>

          {dbError ? (
            <div className="empty-state">
              We couldn't load products right now. Please check back shortly.
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products available yet.</div>
          ) : (
            <ul className="product-grid">
              {products.map((p) => (
                <li key={p.id} className="product-card">
                  <div className="product-card__media" aria-hidden="true">
                    <span className="product-card__initial">
                      {p.name?.charAt(0).toUpperCase() ?? "Z"}
                    </span>
                  </div>
                  <div className="product-card__body">
                    <h3 className="product-card__name">{p.name}</h3>
                    <p className="product-card__desc">{p.description}</p>
                    <div className="product-card__footer">
                      <span className="product-card__price">
                        ${(p.priceCents / 100).toFixed(2)}
                      </span>
                      <button className="product-card__add" type="button">
                        Add to cart
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

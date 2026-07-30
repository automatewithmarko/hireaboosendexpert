'use client';

import { useEffect, useMemo, useState } from 'react';
import { createGigAction } from '@/lib/marketplace/actions';

const CATEGORY_OPTIONS = [
  {
    value: 'ai',
    label: 'AI Builds',
    description: 'Agents, copilots, RAG, and smart automations',
  },
  {
    value: 'support',
    label: 'Support Systems',
    description: 'Customer support flows, helpdesk routing, handoff',
  },
  {
    value: 'dm',
    label: 'DM Funnels',
    description: 'Instagram, WhatsApp, and lead-nurture messaging',
  },
  {
    value: 'setup',
    label: 'Integrations',
    description: 'BooSend setup, APIs, CRM sync, dashboards',
  },
] as const;

const DEFAULT_COVER_GRADIENT = 'linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)';

interface PackageState {
  name: string;
  subtitle: string;
  price: string;
  delivery: string;
  revisions: string;
  description: string;
  features: string;
}

interface GigCreationStudioProps {
  error?: string;
}

function createDefaultPackage(index: number): PackageState {
  if (index === 0) {
    return {
      name: 'Starter',
      subtitle: 'Clean setup for a focused first version',
      price: '150',
      delivery: '3',
      revisions: '1',
      description: 'Core setup with the main automation flow delivered and documented.',
      features: 'Kickoff call\nAutomation build\nDelivery handoff',
    };
  }

  if (index === 1) {
    return {
      name: 'Growth',
      subtitle: 'A fuller build with stronger logic and polish',
      price: '320',
      delivery: '5',
      revisions: '2',
      description: 'Expanded build with stronger logic, testing, and team handoff.',
      features: 'Strategy review\nExpanded automation scope\nLoom walkthrough',
    };
  }

  return {
    name: 'Scale',
    subtitle: 'Premium delivery for bigger automation needs',
    price: '650',
    delivery: '7',
    revisions: '3',
    description: 'High-touch implementation with advanced integrations and optimization.',
    features: 'Advanced build\nOptimization pass\nPriority support',
  };
}

function getErrorMessage(error?: string) {
  switch (error) {
    case 'image-upload-failed':
      return 'The gig saved, but one or more images could not be uploaded. Please try again.';
    case 'package-create-failed':
      return 'The package setup could not be saved. Please review your package details.';
    case 'gig-create-failed':
      return 'We could not create the gig right now. Please try again.';
    default:
      return 'Please review the form and try again.';
  }
}

export function GigCreationStudio({ error }: GigCreationStudioProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]['value']>('setup');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState(
    'What are you trying to automate?\nWhat tools are already in your stack?\nDo you have brand voice or example flows?',
  );
  const [coverGradient] = useState(DEFAULT_COVER_GRADIENT);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);
  const [packages, setPackages] = useState<PackageState[]>([createDefaultPackage(0)]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [coverPreview, galleryPreviews]);

  const startingPrice = useMemo(() => {
    return packages.reduce((minPrice, item) => {
      const value = Number(item.price || 0);
      if (!value) return minPrice;
      return minPrice === 0 ? value : Math.min(minPrice, value);
    }, 0);
  }, [packages]);

  const setPackageField = (
    index: number,
    field: keyof PackageState,
    value: string,
  ) => {
    setPackages((current) =>
      current.map((pkg, pkgIndex) =>
        pkgIndex === index
          ? {
              ...pkg,
              [field]: value,
            }
          : pkg,
      ),
    );
  };

  const addPackage = () => {
    setPackages((current) =>
      current.length >= 3 ? current : [...current, createDefaultPackage(current.length)],
    );
  };

  const removePackage = (index: number) => {
    setPackages((current) => current.filter((_, pkgIndex) => pkgIndex !== index));
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    const file = event.target.files?.[0];
    setCoverFileName(file?.name ?? '');
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    setGalleryFileNames(files.map((file) => file.name));
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  return (
    <form action={createGigAction} className="gig-studio">
      <div className="gig-studio-shell gig-studio-shell--single">
        <div className="gig-studio-main">
          <section className="gig-studio-panel gig-studio-panel--hero">
            <div className="gig-studio-kicker">Seller Studio</div>
            <div className="gig-studio-hero-copy">
              <h1>Build a high-end service listing that feels ready for serious buyers.</h1>
              <p>
                Shape the offer, cover image, gallery, and package structure in one polished flow.
              </p>
            </div>
            <div className="gig-studio-chip-row">
              <span className="gig-studio-chip">Cover upload</span>
              <span className="gig-studio-chip">Up to 3 custom packages</span>
              <span className="gig-studio-chip">Gallery images</span>
            </div>
          </section>

          {error && <div className="signin-error gig-studio-error">{getErrorMessage(error)}</div>}

          <section className="gig-studio-panel">
            <div className="gig-studio-section-head">
              <div>
                <h2>Service overview</h2>
                <p>Set the positioning, headline, and category for your service.</p>
              </div>
              <div className="gig-studio-summary-pill">
                Starting at <strong>${startingPrice || 0}</strong>
              </div>
            </div>

            <div className="gig-studio-grid gig-studio-grid--two">
              <label className="auth-field gig-studio-field">
                <span className="auth-label">Gig title</span>
                <input
                  name="title"
                  className="auth-input gig-studio-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="I will build your BooSend automation funnel"
                  required
                />
              </label>

              <div className="auth-field gig-studio-field">
                <span className="auth-label">Category</span>
                <input type="hidden" name="category" value={category} />
                <div className="gig-studio-category-grid">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`gig-studio-category-card${category === option.value ? ' active' : ''}`}
                      onClick={() => setCategory(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="auth-field gig-studio-field">
              <span className="auth-label">Short description</span>
              <textarea
                name="description"
                className="auth-input gig-studio-input gig-studio-textarea"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain the buyer outcome, not just the deliverable."
                required
              />
            </label>
          </section>

          <section className="gig-studio-panel">
            <div className="gig-studio-section-head">
              <div>
                <h2>Cover and gallery</h2>
                <p>Add a strong cover first, then upload gallery images that help buyers trust the quality of the work.</p>
              </div>
            </div>

            <div className="gig-studio-cover-grid">
              <article className="gig-studio-media-card">
                <div className="gig-studio-media-card-head">
                  <div>
                    <h3>Cover image</h3>
                    <p>Use one clean wide image. Best results come from a 1280 x 768 layout.</p>
                  </div>
                  <span className="gig-studio-media-badge">16:9 friendly</span>
                </div>

                <label className="gig-studio-upload gig-studio-upload--card">
                  <input
                    type="file"
                    name="coverFile"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="gig-studio-upload-input"
                  />
                  <span className="gig-studio-upload-button">Choose cover file</span>
                  <div className="gig-studio-upload-copy">
                    <strong>{coverFileName || 'No cover selected yet'}</strong>
                    <span>PNG or JPG. Keep the subject centered so it crops beautifully across the app.</span>
                  </div>
                </label>

                <input type="hidden" name="coverGradient" value={coverGradient} />

                <div className="gig-studio-cover-preview">
                  <div
                    className="gig-studio-cover-canvas"
                    style={{
                      background: coverPreview
                        ? `linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.28)), url(${coverPreview}) center/cover`
                        : coverGradient,
                    }}
                  >
                    <div className="gig-studio-cover-overlay">
                      <strong>{title || 'Cover preview'}</strong>
                      <span>{description || 'Your cover will appear here once you upload it.'}</span>
                    </div>
                  </div>
                </div>
              </article>

              <article className="gig-studio-media-card">
                <div className="gig-studio-media-card-head">
                  <div>
                    <h3>Gallery images</h3>
                    <p>Add supporting visuals that show process, outcomes, screenshots, or proof of quality.</p>
                  </div>
                  <span className="gig-studio-media-badge">Up to 5</span>
                </div>

                <label className="gig-studio-upload gig-studio-upload--card">
                  <input
                    type="file"
                    name="galleryFiles"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="gig-studio-upload-input"
                  />
                  <span className="gig-studio-upload-button">Choose gallery files</span>
                  <div className="gig-studio-upload-copy">
                    <strong>
                      {galleryFileNames.length > 0
                        ? `${galleryFileNames.length} file${galleryFileNames.length === 1 ? '' : 's'} selected`
                        : 'No gallery files selected yet'}
                    </strong>
                    <span>Upload up to five JPG or PNG images to support the main cover.</span>
                  </div>
                </label>

                {galleryFileNames.length > 0 && (
                  <div className="gig-studio-file-list" aria-label="Selected gallery files">
                    {galleryFileNames.map((fileName) => (
                      <span key={fileName} className="gig-studio-file-pill">
                        {fileName}
                      </span>
                    ))}
                  </div>
                )}

                <div className="gig-studio-gallery-grid">
                  {galleryPreviews.length > 0 ? (
                    galleryPreviews.map((preview, index) => (
                      <div key={preview} className="gig-studio-gallery-card">
                        <img src={preview} alt={`Gallery upload ${index + 1}`} />
                        <span>Gallery image {index + 1}</span>
                      </div>
                    ))
                  ) : (
                    <div className="gig-studio-gallery-empty">
                      <strong>Gallery preview</strong>
                      <span>Uploaded supporting images will appear here in a clean grid.</span>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="gig-studio-panel">
            <div className="gig-studio-section-head">
              <div>
                <h2>Buyer requirements</h2>
                <p>Ask for the details you need before you start building.</p>
              </div>
            </div>

            <label className="auth-field gig-studio-field">
              <span className="auth-label">Requirement prompts</span>
              <textarea
                name="requirements"
                className="auth-input gig-studio-input gig-studio-textarea"
                rows={5}
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
              />
            </label>
          </section>

          <section className="gig-studio-panel">
            <div className="gig-studio-section-head">
              <div>
                <h2>Packages</h2>
                <p>Start with one package. Add up to three and name each one your way.</p>
              </div>
            </div>

            <input type="hidden" name="packageCount" value={packages.length} />

            <div className="gig-studio-package-grid gig-studio-package-grid--editor">
              {packages.map((pkg, index) => (
                <fieldset
                  key={`${pkg.name}-${index}`}
                  className="gig-studio-package-card"
                >
                  <div className="gig-studio-package-head">
                    <div className="gig-studio-package-title-wrap">
                      <label className="auth-field gig-studio-field">
                        <span className="auth-label">Package name</span>
                        <input
                          name={`package${index + 1}Name`}
                          className="auth-input gig-studio-input"
                          value={pkg.name}
                          onChange={(event) =>
                            setPackageField(index, 'name', event.target.value)
                          }
                          required
                        />
                      </label>
                      <label className="auth-field gig-studio-field">
                        <span className="auth-label">Small subtitle</span>
                        <input
                          name={`package${index + 1}Subtitle`}
                          className="auth-input gig-studio-input"
                          value={pkg.subtitle}
                          onChange={(event) =>
                            setPackageField(index, 'subtitle', event.target.value)
                          }
                          placeholder="Great for a focused first build"
                        />
                      </label>
                    </div>

                    {packages.length > 1 && (
                      <button
                        type="button"
                        className="gig-studio-package-remove"
                        onClick={() => removePackage(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="gig-studio-inline-grid">
                    <label className="auth-field gig-studio-field">
                      <span className="auth-label">Price</span>
                      <input
                        name={`package${index + 1}Price`}
                        type="number"
                        min="0"
                        className="auth-input gig-studio-input"
                        value={pkg.price}
                        onChange={(event) =>
                          setPackageField(index, 'price', event.target.value)
                        }
                        required
                      />
                    </label>
                    <label className="auth-field gig-studio-field">
                      <span className="auth-label gig-studio-label-nowrap">Delivery days</span>
                      <input
                        name={`package${index + 1}Delivery`}
                        type="number"
                        min="1"
                        className="auth-input gig-studio-input"
                        value={pkg.delivery}
                        onChange={(event) =>
                          setPackageField(index, 'delivery', event.target.value)
                        }
                        required
                      />
                    </label>
                    <label className="auth-field gig-studio-field">
                      <span className="auth-label">Revisions</span>
                      <input
                        name={`package${index + 1}Revisions`}
                        type="number"
                        min="1"
                        className="auth-input gig-studio-input"
                        value={pkg.revisions}
                        onChange={(event) =>
                          setPackageField(index, 'revisions', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <label className="auth-field gig-studio-field">
                    <span className="auth-label">Package description</span>
                    <textarea
                      name={`package${index + 1}Description`}
                      rows={4}
                      className="auth-input gig-studio-input gig-studio-textarea"
                      value={pkg.description}
                      onChange={(event) =>
                        setPackageField(index, 'description', event.target.value)
                      }
                    />
                  </label>

                  <label className="auth-field gig-studio-field">
                    <span className="auth-label">What&apos;s included</span>
                    <textarea
                      name={`package${index + 1}Features`}
                      rows={4}
                      className="auth-input gig-studio-input gig-studio-textarea"
                      value={pkg.features}
                      onChange={(event) =>
                        setPackageField(index, 'features', event.target.value)
                      }
                    />
                  </label>
                </fieldset>
              ))}

              {packages.length < 3 && (
                <button
                  type="button"
                  className="gig-studio-package-add"
                  onClick={addPackage}
                >
                  <span className="gig-studio-package-add-icon">+</span>
                  <strong>Add package</strong>
                  <span>Bring in another pricing tier</span>
                </button>
              )}
            </div>
          </section>

          <aside className="gig-studio-note-card">
            <h3>Quick publishing notes</h3>
            <p>Cover image first. Strong package naming second. Keep each tier clearly different in scope, not just price.</p>
            <ul>
              <li>Use the cover image for your strongest visual.</li>
              <li>Keep package names short and memorable.</li>
              <li>Make delivery times realistic to protect trust.</li>
            </ul>
          </aside>

          <div className="gig-studio-footer">
            <button type="submit" className="auth-submit gig-studio-submit">
              Submit Gig For Review
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

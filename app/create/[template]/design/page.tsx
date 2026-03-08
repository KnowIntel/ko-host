import { DESIGN_PRESETS } from "@/lib/design-presets/designRegistry";
import DesignCard from "@/components/designs/DesignCard";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";

function resolveTemplateFromRoute(rawTemplate: string) {
  const normalized = normalizeTemplateKey(rawTemplate);

  return (
    getTemplateDef(normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.demoSlug) === normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.thumb) === normalized) ||
    TEMPLATE_DEFS.find(
      (t) => normalizeTemplateKey(t.title.replace(/\s+/g, "_")) === normalized,
    ) ||
    TEMPLATE_DEFS[0]
  );
}

function getRecommendedDesignKey(templateKey: string) {
  const map: Record<string, string> = {
    baby_shower: "gallery",
    crowdfunding_campaign: "modern",
    family_reunion: "gallery",
    memorial_tribute: "elegant",
    open_house: "gallery",
    birthday_party: "gallery",
    product_launch: "modern",
    waitlist: "classic",
    property_listing: "elegant",
    rental_listing: "elegant",
    resume_profile: "classic",
    wedding_rsvp: "gallery",
    beta_testing: "classic",
    business_card: "classic",
    church_event: "gallery",
    commercial_leasing: "classic",
    community_alert: "classic",
    companion_service: "classic",
    conference: "classic",
    contractor_portfolio: "minimal",
    creator_portfolio: "minimal",
    divorce_announcement: "classic",
    election_campaign: "gallery",
    engagement_announcement: "gallery",
    exploration_guide: "minimal",
    for_sale_by_owner: "classic",
    nft_drop: "minimal",
    gender_reveal: "gallery",
    graduation: "gallery",
    group_trip: "minimal",
    hoa_announcement: "classic",
    investor_pitch: "classic",
    job_fair: "classic",
    merchant_drop: "classic",
    pet_adoption: "classic",
    private_discord: "classic",
    relocation: "classic",
    service_promo: "classic",
    corporate_event: "gallery",
    deal_room: "classic",
    dedication: "elegant",
    disaster_relief: "modern",
    hackathon: "modern",
    landlord_property: "classic",
    legal_defense: "classic",
    live_entertainment: "gallery",
    masterclass: "modern",
    meet_and_greet: "elegant",
    members_only: "modern",
    missing_person: "modern",
    online_course: "classic",
    school_fundraiser: "gallery",
    secure_document: "classic",
    service_ad: "classic",
    settlement_info: "classic",
    software_trial: "classic",
    stock_trade_thesis: "classic",
    vip_access: "classic",
    webinar: "modern",
    workshop: "classic",
    photo_gallery: "minimal",
    block_party: "gallery",
    surprise_party: "gallery",
    celebration_of_life: "gallery",
    retirement_party: "gallery",
    holiday_party_invite: "gallery",
    friendsgiving_event: "gallery",
    housewarming_party: "gallery",
    bachelor_party: "gallery",
    bachelorette_party: "gallery",
    charity_gala_event: "gallery",
    alumni_meetup: "modern",
    neighborhood_bbq: "gallery",
    yard_sale: "modern",
    sports_team_party: "gallery",
    bridal_shower: "gallery",
    baptism_event: "modern",
    christening_event: "modern",
    cultural_festival_invite: "gallery",
    music_recital_invite: "gallery",
    limited_time_offer: "modern",
    flash_sale: "modern",
    black_friday_promotion: "modern",
    new_service_announcement: "modern",
    startup_demo_day: "modern",
    brand_collaboration: "modern",
    influencer_campaign: "modern",
    garage_sale: "minimal",
    marketing_campaign_landing: "classic",
    new_store_opening_announcement: "gallery",
    seasonal_promotion: "modern",
    brand_giveaway: "modern",
    contest_entry: "gallery",
    affiliate_campaign: "classic",
    referral_program: "classic",
    airbnb_vacation_rental: "minimal",
    land_sale_listing: "elegant",
    property_auction: "classic",
    new_development_preview: "minimal",
    freelancer_portfolio: "minimal",
    designer_portfolio: "minimal",
    developer_portfolio: "minimal",
    speaker_profile: "classic",
    job_candidate_showcase: "classic",
    consultant_service: "classic",
    temporary_work_portfolio: "classic",
    community_announcement: "classic",
    neighborhood_alert: "modern",
    local_volunteer_signup: "modern",
    nonprofit_campaign: "modern",
    school_event: "gallery",
    local_sports_league_signup: "modern",
    community_poll: "modern",
    public_feedback: "classic",
    town_hall_discussion: "classic",
    podcast_episode: "modern",
    youtube_video_launch: "modern",
    creator_link_hub: "modern",
    patreon_campaign: "modern",
    digital_product_launch: "modern",
    course_enrollment: "modern",
    live_stream_event: "gallery",
    book_club: "elegant",
    newsletter_signup: "classic",
    moving_sale: "modern",
    estate_sale_listing: "elegant",
    lost_found_notice: "modern",
    pet_missing_alert: "modern",
    local_classified_ad: "classic",
    temporary_project: "classic",
    focus_group: "classic",
    obstacle_race: "modern",
    memory_timeline: "modern",
    after_grad: "gallery",
    cancer_journey: "modern",
    bible_study: "modern",
    chat_room: "modern",
    speed_dating: "modern",
    weight_loss_journey: "minimal",
    guided_tutorial: "classic",
  };

  return map[templateKey] || "minimal";
}

function orderDesigns(templateKey: string) {
  const recommendedKey = getRecommendedDesignKey(templateKey);

  const recommended = DESIGN_PRESETS.find(
    (design) => design.key === recommendedKey && design.key !== "blank",
  );

  const middle = DESIGN_PRESETS.filter(
    (design) => design.key !== recommendedKey && design.key !== "blank",
  );

  const blank = DESIGN_PRESETS.find((design) => design.key === "blank");

  return [
    ...(recommended ? [recommended] : []),
    ...middle,
    ...(blank ? [blank] : []),
  ];
}

export default async function DesignSelectionPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  const templateDef = resolveTemplateFromRoute(template);
  const templateKey = templateDef.key;

  const orderedDesigns = orderDesigns(templateKey);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-100/50 via-violet-100/30 to-cyan-100/50" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                Step 1 of 2
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                Choose a design
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                Pick the design style for your{" "}
                <span className="font-semibold text-neutral-900">
                  {templateDef.title}
                </span>{" "}
                page. After this, you’ll customize the content, blocks, and layout in the builder.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                  Template: {templateDef.title}
                </span>
                <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                  {orderedDesigns.length} designs
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Design presets
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            The first option is the recommended fit for this template. Blank Design is always last.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {orderedDesigns.map((design, index) => (
            <DesignCard
              key={design.key}
              templateKey={templateKey}
              designKey={design.key}
              label={design.label}
              image={`/designs/${design.key}.webp`}
              isRecommended={index === 0}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
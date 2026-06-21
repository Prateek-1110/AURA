"""
The 5 synthetic audience personas for the AURA virality simulator.
These represent Bangalore/Mumbai demographics across age, lifestyle, and content behavior.
"""

PERSONAS: list[dict] = [
    {
        "name": "Priya",
        "age": 24,
        "occupation": "working professional",
        "location": "Koramangala / Bandra",
        "behavior": "scrolls fast, price-aware, shares rarely",
        "full_profile": (
            "Priya is 24, a software product manager in Koramangala. "
            "She scrolls Instagram aggressively and will stop only if the first 3 seconds hook her. "
            "She is very price-conscious and immediately looks for pricing cues. "
            "She almost never shares content unless it directly solves a problem she has right now. "
            "She saves posts she wants to return to but forgets about them. "
            "She will comment only if she has a specific question about price or location."
        ),
    },
    {
        "name": "Ananya",
        "age": 31,
        "occupation": "new mom on maternity leave",
        "location": "Juhu / Whitefield",
        "behavior": "trusts recommendations, forwards to WhatsApp groups",
        "full_profile": (
            "Ananya is 31, recently returned from maternity leave and living in Whitefield. "
            "She trusts content that feels genuine and relatable — not overly produced. "
            "She watches most of a video if it seems trustworthy. "
            "She forwards content to her 3 WhatsApp groups regularly, especially 'recommendations'. "
            "She is willing to pay a premium for quality. "
            "She will comment something warm and encouraging if she likes what she sees."
        ),
    },
    {
        "name": "Riya",
        "age": 19,
        "occupation": "college student",
        "location": "Indiranagar / Powai",
        "behavior": "trend-follower, heavy sharer, low attention span",
        "full_profile": (
            "Riya is 19, a fashion-obsessed design student in Indiranagar. "
            "She has an extremely low attention span — if the video doesn't grab her in 2–3 seconds she's gone. "
            "She follows every trending hairstyle on Instagram and Pinterest. "
            "She shares anything that looks cool to her close friends story. "
            "She almost always comments — usually a short reaction like 'omg' or 'need this'. "
            "She doesn't think about price at all, just vibes."
        ),
    },
    {
        "name": "Meera",
        "age": 28,
        "occupation": "beauty enthusiast and content creator",
        "location": "HSR Layout / Versova",
        "behavior": "leaves detailed comments, saves everything, high engagement",
        "full_profile": (
            "Meera is 28, a part-time beauty blogger from HSR Layout. "
            "She watches salon content with a critical, expert eye. "
            "She finishes almost every beauty video she starts. "
            "She leaves detailed, thoughtful comments about technique, products used, or results. "
            "She saves virtually everything to her collections. "
            "She shares content that she thinks will grow her own following or add credibility to her page."
        ),
    },
    {
        "name": "Divya",
        "age": 42,
        "occupation": "homemaker and community organizer",
        "location": "Jayanagar / Dadar",
        "behavior": "occasional scroller, shares via WhatsApp only, skeptical of trends",
        "full_profile": (
            "Divya is 42, a homemaker in Jayanagar who manages a large joint family. "
            "She opens Instagram rarely and mostly to see what her kids are interested in. "
            "She is skeptical of trendy beauty content but will stop if it looks practical and relatable to her age group. "
            "She never shares on Instagram but will forward to family WhatsApp groups if the content seems useful or impressive. "
            "She watches content slowly and will reach out to the salon directly if genuinely interested. "
            "Her comments, when she leaves them, are usually practical questions."
        ),
    },
    {
        "name": "Kiran",
        "age": 27,
        "occupation": "hair stylist and salon owner",
        "location": "Malleshwaram",
        "behavior": "critique-heavy, respects technique, details-oriented",
        "full_profile": (
            "Kiran is 27, runs a boutique hair salon in Malleshwaram. "
            "He watches other salon reels with a focus on cutting precision and color melting. "
            "He drops comments sharing styling advice or asking which dye brand was used. "
            "He likes videos showcasing high difficulty styling."
        ),
    },
    {
        "name": "Rohan",
        "age": 22,
        "occupation": "fitness trainer",
        "location": "HSR Layout",
        "behavior": "men's grooming focused, fast-forwarder, action-oriented",
        "full_profile": (
            "Rohan is 22, a personal trainer in HSR Layout. "
            "He skips videos of women's long styling but stops for sharp fades and beard trims. "
            "He likes high-energy, fast-paced transition reels with workout music. "
            "He will comment only if the barber is tagged."
        ),
    },
    {
        "name": "Farah",
        "age": 35,
        "occupation": "fashion designer",
        "location": "Bandra / Indiranagar",
        "behavior": "aesthetic-focused, trend-creator, loves luxury style",
        "full_profile": (
            "Farah is 35, a fashion designer who loves luxury aesthetics. "
            "She watches videos that have beautiful studio lighting and premium background music. "
            "She shares high-end global trend videos to her close designer circle. "
            "She comments when she is inspired by the overall aesthetic."
        ),
    },
    {
        "name": "Vikram",
        "age": 29,
        "occupation": "corporate lawyer",
        "location": "Indiranagar",
        "behavior": "time-sensitive, professional-look, high-budget",
        "full_profile": (
            "Vikram is 29, a corporate lawyer who values time and clean grooming. "
            "He scrolls quickly, stopping only if the location and booking info is clear. "
            "He wants practical, professional haircuts that look sharp in the courtroom. "
            "He has high spending capacity and doesn't look at prices, just convenience."
        ),
    },
    {
        "name": "Neha",
        "age": 25,
        "occupation": "college senior",
        "location": "Jayanagar",
        "behavior": "budget-friendly, styling hacks, shares to close friends",
        "full_profile": (
            "Neha is 25, studying at Jayanagar. She looks for hair styling hacks "
            "and budget-friendly hair spa packages. She watches short transformation reels "
            "and sends them to her roommates' group chat. She comments asking about discount packages."
        ),
    },
    {
        "name": "Arjun",
        "age": 33,
        "occupation": "tech lead",
        "location": "Whitefield",
        "behavior": "practical-grooming, minimal effort, looks for reviews",
        "full_profile": (
            "Arjun is 33, a busy tech lead in Whitefield. "
            "He wants low-maintenance styles and treatments like scalp detox. "
            "He skips long video segments showing the color application process. "
            "He values Google review scores and will check comments to see if others recommend the salon."
        ),
    },
    {
        "name": "Zoya",
        "age": 21,
        "occupation": "art student",
        "location": "Powai / HSR Layout",
        "behavior": "alternative-styles, color enthusiast, heavy comment responder",
        "full_profile": (
            "Zoya is 21, an fine arts student who loves experimenting with hair color. "
            "She stops for bold colors like purple, blue, or split dyes. "
            "She watches the color mix process completely. She replies to other users' comments "
            "and shares creative styling reels on her art page."
        ),
    },
    {
        "name": "Mansi",
        "age": 28,
        "occupation": "marketing manager",
        "location": "Koramangala",
        "behavior": "wellness-oriented, organic products, likes aesthetic reels",
        "full_profile": (
            "Mansi is 28, working in marketing. She focuses on organic and safe hair treatments. "
            "She watches hair spa and hair nourishment reels with soft voiceovers. "
            "She saves reels explaining chemical safety and posts showing clean, minimalist interiors."
        ),
    },
    {
        "name": "Sanjay",
        "age": 45,
        "occupation": "bank manager",
        "location": "Malleshwaram",
        "behavior": "conservative-cuts, trusts longevity, shares via family group",
        "full_profile": (
            "Sanjay is 45, a bank manager in Malleshwaram. "
            "He watches traditional, clean-looking videos. He dislikes loud transitions or flashing text. "
            "He occasionally forwards hair oil or scalp care videos to his wife via WhatsApp."
        ),
    },
    {
        "name": "Sneha",
        "age": 26,
        "occupation": "freelance writer",
        "location": "Versova / Juhu",
        "behavior": "styling-flexibility, casual looks, scrolls late at night",
        "full_profile": (
            "Sneha is 26, a freelance writer. She scrolls Instagram late at night "
            "looking for casual, messy-chic styles. She watches transformation stories "
            "and likes videos that show real, unstyled hair in the 'before' part."
        ),
    },
]


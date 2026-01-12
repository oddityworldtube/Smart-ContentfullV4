import { PromptTemplate } from '../types';

export const DEFAULT_PROMPTS: PromptTemplate[] = [
    {
        id: 'detect_language',
        name: 'كشف اللغة',
        description: 'تحديد لغة النص المدخل.',
        category: 'Analysis',
        variables: ['text'],
        template: `
        Analyze the following text and identify its language.
        
        Text: "{text}"
        
        Return ONLY the name of the language in English (e.g. "Arabic", "English", "French", "Spanish").
        If the text is mixed or unclear, return "Arabic".
        `
    },
    {
        id: 'detect_smart_profile',
        name: 'تحليل البروفايل المناسب (Auto-Match)',
        description: 'تحليل العنوان واختيار معرف البروفايل الأنسب من القائمة.',
        category: 'Analysis',
        variables: ['topic', 'profilesJson'],
        template: `
        **Role:** Content Strategy AI.
        **Task:** Analyze the user's topic and select the BEST matching "Smart Profile" ID from the provided list.

        **User Topic:** "{topic}"

        **Available Profiles:**
        {profilesJson}

        **Logic:**
        - If the topic is about psychology, manipulation, or secrets -> "dark_psych"
        - If history, wars, biography -> "history"
        - If crime, mystery, police -> "true_crime"
        - If tech, gadgets, AI -> "tech"
        - If business, money, stocks -> "business"
        - If health, diet, gym -> "health"
        - If tutorial, how-to -> "edu"
        - If general story -> "docu"

        **Output:**
        Return ONLY a JSON object with the id.
        Example: { "id": "history" }
        If no strong match found, return { "id": "docu" }.
        `
    },
    {
        id: 'generate_titles_only',
        name: 'توليد عناوين فيرال (Viral Titles)',
        description: 'توليد 5 عناوين فيرال مع تحليل نفسي.',
        category: 'Optimization',
        variables: ['currentTitle', 'language'],
        template: `
**Task:** Generate 5 VIRAL YouTube titles for the topic: "{currentTitle}".
**Language:** **{language}**.

**Requirements:**
- High CTR.
- Use Power Words.
- Analyze the psychology of each title.

**Output:** JSON.
{
  "titles": [
    {
      "title": "Proposed Title",
      "score": 90,
      "psychology": {
        "curiosityScore": 85,
        "urgencyScore": 70,
        "emotionType": "Shock",
        "powerWords": ["Secret", "Never"],
        "analysis": "Explanation"
      }
    }
  ]
}
`
    },
{
        id: "generate_full_script",
        name: "توليد سكربت فيديو كامل (Content Master)",
        description: "صياغة نص احترافي يبدأ بهوك خاطف وقوي بدلاً من المقدمات التقليدية.",
        category: "Creative",
        variables: ["title", "wordCount", "language", "tone", "audience", "format", "persona", "style", "cta"],
        template: `
**ROLE:** You are a world-class Master Content Architect and Professional Scriptwriter acting as a "{persona}".
**TASK:** Create a high-retention, value-packed {format} about: "{title}".

**STRICT LINGUISTIC & STYLE DIRECTIVES:**
1. **LANGUAGE:** You MUST write the entire script in **{language}**. If the language is "Arabic", then you must adhere to using only high-level Modern Standard Arabic (الفصحى) and avoid any regional dialects completely.
2. **NUMBERS:** You MUST write all numbers as words in the target language ({language}). For example, if the language is Arabic, "2025" becomes "ألفين وخمسة وعشرين". If English, it becomes "two thousand twenty-five".
3. **TONE & PACING:** Maintain a {tone} tone. You MUST engineer the rhythm specifically for the attention span of {audience}. To prevent {audience} from getting bored/distracted, Maintain a rhythmic flow suitable for narration. Use short, impactful sentences, but group them into coherent paragraphs rather than isolated lines. Ensure smooth transitions between ideas to create a natural storytelling pace.STRICTLY AVOID long, run-on sentences connected by conjunctions; use full stops (.) frequently to create dramatic pauses that allow {audience} to process the information.
4. **Visual and Sensory Language:** Write "for the ear but draw for the eye." Use descriptive and sensory words that evoke mental images. Avoid abstract concepts; instead of saying "Technology has improved," say "This technology has made a tremendous leap at an astonishing speed." Minimize metaphors and similes; keep your style simple.
5. **DIRECT ADDRESS:** Heavily use the second person (e.g., "you", "your") appropriate for the target language ({language}). Address the viewer's specific pains, fears, and ambitions directly to build an intimate connection.
6. **SHOW, DON'T TELL:** Do not just state facts. Use sensory details. Instead of saying "The king was angry," describe how "The king's knuckles turned white as he gripped his throne." Make the listener *feel* the scene.
**WORD COUNT ADHERENCE (STRICT REQUIREMENT):**
- **Target Length:** Exactly {wordCount} words. 
- **Expansion Strategy:** If the topic is broad, you MUST expand deeply into technical details, real-world examples, historical context, and psychological analysis to reach the required length. Do NOT be repetitive; instead, provide more unique value and depth in each section.

**SCRIPT ARCHITECTURE (CRITICAL):**
1. **THE RAZOR-SHARP HOOK (0-10s):** Start IMMEDIATELY with a powerful, concentrated Hook.
   - **Constraint:** Maximum 2 to 3 short sentences.
   - **Requirement:** Must be a shocking fact, a perplexing mystery, or a thought-provoking question related to "{Title}" that immediately grabs attention. Keep the introduction concise; there is no room for elaboration.
   - **STRICT PROHIBITION:** Do NOT use "Welcome", "Hello", "In this video", or any introductory greetings. Dive straight into the heart of the topic from the very first word.
2. **CONTENT CORE:** Structure the body strictly according to the active {style}:
   - **CASE A: LISTS & STEPS** (For styles: "قائمة (Top 10)", "تعليمي (How-to)", "تبسيط العلوم"):
     *   Structure: Organize content into 4-7 distinct, numbered pillars or steps.
     *   Focus: Clarity, rapid value delivery, and actionable advice.
   - **CASE B: NARRATIVE & STORY** (For styles: "سردي قصصي", "وثائقي", "تحقيق جنائي", "سرد سينمائي", "ملحمي"):
     *   Structure: Use a fluid narrative arc (Inciting Incident -> Rising Action -> Climax -> Resolution).
     *   Focus: Immersion, suspense, and emotional connection. STRICTLY FORBIDDEN to use "Step 1" or numbered lists here.
   - **CASE C: DEEP ANALYSIS** (For styles: "تحليلي", "نفسي عميق", "نقاشي"):
     *   Structure: Thematic layers. Peel back the layers of the topic one by one (Concept -> Evidence -> Dark Implication).
     *   Focus: Psychological triggers, hidden truths, and answering "Why" rather than just "What".
   - **GENERAL RULE:** Whichever structure you use, you MUST achieve the {wordCount} by adding depth, specific real-world examples, and sensory details, NOT by repetition.
3. **THE PUNCHY OUTRO (FAST & DIRECT):**
   - **STRICT PROHIBITION:** Do NOT summarize the video. Do NOT say "In conclusion" or "To sum up". The viewer already watched the video, they don't need a recap.
   - **Structure:** 
     1. One final powerful thought or question that lingers in the viewer's mind (Max 1 sentence).
     2. Execute this action immediately: "{cta}".
   - **LENGTH LIMIT:** The entire outro must be LESS than 40 words.
   - **Flow:** Hit the viewer with the final insight -> Call to Action -> End. No fluff. No long goodbyes   

**FORMATTING RULES (VOICEOVER READY):**
1. **CLEAN TEXT ONLY:** DO NOT use Markdown bolding (**text**), hashes (#), or any symbols. The text must be clean plain text.
2. **NO METADATA/HEADINGS:** Do NOT include labels like "Hook:", "Intro:", "Conclusion:", "Voiceover:", or scene descriptions.
3. **OUTPUT:** The result must be the raw, spoken script only, exactly as it should be recorded.

**FINAL INSTRUCTION:** Return ONLY the clean spoken text of the script. Verify that the length is approximately {wordCount} words before finalizing.`
    },
    {
        id: "generate_meta_from_script",
        name: "توليد بيانات SEO من السكربت",
        description: "استخراج عنوان جذاب، ووصف، وعلامات من نص الفيديو.",
        category: "Optimization",
        variables: ["scriptContent", "language"],
        template: `
Act as an expert YouTube SEO strategist. Your task is to analyze the provided video script and generate highly optimized metadata to maximize discoverability, engagement, and search ranking.

**Analysis Context:**
- **Script Content:** {scriptContent}
- **Target Language:** {language}

**Core Directives:**

1.  **Title Generation:**
    -   Craft a high-CTR, viral-style title (strictly under 70 characters) designed to stop the scroll.
    -   **Psychology:** Use "Negative Bias" (e.g., "Stop doing this," "The Mistake," "Warning") or "Extreme Curiosity" (e.g., "The Secret No One Tells You"). These perform better than positive titles.
    -   **Power Words:** Include strong emotional triggers like (Exposed, Dangerous, Banned, Lies, Truth, Finally).
    -   **Format:** Avoid generic descriptions. Instead, use formats like: "Why X is a Lie," "The [Adjective] Truth About [Keyword]," or "Don't [Action] Until You Watch This."

2.  **Description Generation:**
    -   Write a detailed, keyword-rich description (minimum 2 paragraphs).
    -   The first 1-2 sentences are critical for SEO; they must contain the primary keywords and act as a strong hook.
    -   Provide a comprehensive summary of the video's key points.Estimate the video duration INTERNALLY based on word count (approx. 130-140 wpm) to generate accurate time codes. Do NOT include the total estimated duration text or any calculation notes in the final output; only list the specific timestamps starting from 00:00.
    -   Conclude the description with a set of 7 to 15 highly relevant and popular hashtags to boost visibility.

3.  **Tags Generation:**
    -   Generate a strategic list of 15-20 SEO tags.
    -   This list must include a mix of: broad category keywords, specific long-tail keywords, and LSI (Latent Semantic Indexing) keywords that reflect the video's content and potential user searches.

**CRITICAL OUTPUT FORMAT:**
Your entire response MUST be a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON structure.

**Output JSON Schema:**
{
  "title": "A compelling, SEO-driven title here",
  "description": "A detailed, keyword-rich description starting with a strong hook.\\n\\nTimestamps (if applicable):\\n00:00 - Key Topic 1\\n01:30 - Key Topic 2\\n\\n#relevantHashtag #seoHashtag #videoTopicHashtag",
  "tags": ["primary keyword", "long-tail keyword phrase", "related search term", "video topic tag"]
}
`
    },
    {
        id: "convert_to_shorts_script",
        name: "تحويل إلى سكربت شورتس متكامل",
        description: "تحويل المحتوى الطويل إلى حزمة شورتس كاملة (سكربت، عنوان، وصف، كلمات دلالية).",
        category: "Creative",
        variables: ["longScript", "language"],
        template: `
**ROLE:** You are a Viral Content Strategist specializing in Educational Shorts and "Value Bomb" delivery.
**TASK:** Extract 3 to 5 high-value, mind-blowing facts from the provided source text and turn them into a fast-paced, high-retention Shorts package.

**SOURCE TEXT:** {longScript}

**STRICT LINGUISTIC RULES:**
1. **LANGUAGE:** Use ONLY Modern Standard Arabic (الفصحى). No dialects.
2. **NUMBERS:** Convert ALL digits into written Arabic words.
3. **TONE:** Intellectual, authoritative, and fast-paced.

**JSON OUTPUT STRUCTURE:**
You MUST return a valid JSON object with these EXACT keys:
- "script": "The complete spoken text as a single continuous paragraph. Starts with a 3-second cognitive hook. Just the spoken words."
- "title": A viral title under 50 characters in {language}.
- "description": A short description with 5 viral hashtags.
- "keywords": An array of 10 SEO tags for the Short.

**SCRIPT REQUIREMENTS:**
- Clean text ONLY.
- No "Welcome" or "Hello" or "Hook" or "Value" or "CTA".
- Each sentence max 7 words.
- Total duration under 60 seconds.

**Return ONLY the JSON object.**`
    },
    {
        id: "generate_tiktok_description",
        name: "وصف تيك توك (TikTok SEO)",
        description: "إنشاء وصف قصير وجذاب للتيك توك مع هاشتاجات.",
        category: "Optimization",
        variables: ["title", "language"],
        template: `
**TASK:** Write a viral TikTok description for a video about: "{title}".
**LANGUAGE:** {language}.

**REQUIREMENTS:**
1. Short and punchy (1-2 sentences).
2. Ask a question to drive engagement.
3. Include 5-8 trending/relevant hashtags.

**OUTPUT:** Return ONLY the description text with hashtags. No labels.
`
    },
    {
        id: "add_tashkeel",
        name: "إضافة التشكيل (Tashkeel Master)",
        description: "إضافة التشكيل الكامل للنصوص العربية لنطق سليم.",
        category: "Creative",
        variables: ["text"],
        template: `
        **ROLE:** Expert Arabic Linguist.
        **TASK:** Add full diacritics (Harakat/Tashkeel) to the following Arabic text to ensure perfect pronunciation by a Text-to-Speech engine.
        
        **INPUT TEXT:**
        "{text}"

        **RULES:**
        1. Maintain the exact meaning and structure.
        2. Ensure grammar (Nahw) rules are applied correctly.
        3. Output ONLY the vocalized text. Do not add any introductions or explanations.
        `
    },
    {
        id: "suggest_art_style",
        name: "اقتراح ستايل فني (Art Director)",
        description: "تحليل النص واقتراح أفضل ستايل بصري للصور.",
        category: "Vision",
        variables: ["text"],
        template: `
        **ROLE:** Professional Art Director.
        **TASK:** Analyze the following video script and select the ONE best visual art style from the provided library below that fits the mood and content.

        **SCRIPT CONTEXT:**
        "{text}"

        **STYLE LIBRARY:**
        1. Historical oil painting, neoclassical style, dramatic chiaroscuro lighting, epic, moody, highly detailed, masterpiece.  <-- **تاريخي/ملحمي**
        2. Documentary Film Still, High Contrast Black and White, 35mm Grain, Intense Close-up, Interview Setting, Emotional Depth, Raw Footage Look. <-- **وثائقي/علم نفس**
        3. Dark and gritty masculine aesthetic, high-contrast monochromatic, dramatic cinematic lighting, chiaroscuro, photorealistic, ultra-detailed, 8k. <-- **علم نفس/غموض**
        4. Neo-Noir Cinematic Still, High Depth of Field, Introspective Mood, Shadow Play, 1940s Detective Aesthetic, Focus on One Subject, Moody Blues and Golds. <-- **علم نفس/غموض**
        5. Epic Historical Reconstruction, Wide Panoramic Shot, Golden Hour Lighting, Detailed Period Costumes and Architecture, Massive Scale, Shot on RED Camera. <-- **تاريخي/ملحمي**
        6. Abstract Conceptual Art, Surrealism meets Scientific Illustration, Fluid Shapes and Lines Representing Thoughts/Emotions, White or Neutral Background, Minimalist Color Palette. <-- **علم نفس/تبسيط**
        7. Vintage 1970s Documentary Look, Film Grain, Muted Earth Tones (Browns, Oranges, Greens), Candid Unposed Subject, Low-Angle Shot, Authentic Analog Feel. <-- **وثائقي/تاريخي**
        8. stick figure illustration, black and white, flat 2D, minimalistic, symbolic, cinematic composition, emotionally powerful <-- **تجريدي/رمزي**
        9. cinematic still, ultra-realistic, shot on Arri Alexa, anamorphic lens, dramatic lighting, wide angle <-- **عام/سينمائي**
        10. professional portrait photography, Canon EOS R5, 85mm f/1.2 lens, soft studio lighting, bokeh, sharp focus <-- **عام/بورتريه**
        11. professional photography, photorealistic, 8k, sharp focus <-- **عام/واقعي**
        12. hyper-detailed, 3d render, atmospheric lighting, ultra quality <-- **عام/3D**
        13. Studio Ghibli aesthetic, 2D anime film still, beautiful painterly watercolor backgrounds, lush and vibrant scenery, soft golden hour lighting, nostalgic and whimsical atmosphere, charming character design, clean line art, masterpiece quality. <-- **رسوم متحركة**
        14. anime style, key visual, beautiful, detailed, official art <-- **رسوم متحركة**
        15. watercolor painting, vibrant colors, artistic, beautiful <-- **فني/رسم يدوي**
        16. vintage photo, shot on Kodak Portra 400, 35mm film grain, slightly faded colors, retro aesthetic, 1980s <-- **قديم/ريترو**
        17. National Geographic photography, wildlife, telephoto lens, hyper-detailed fur, natural lighting, candid shot <-- **طبيعة/تصوير ميداني**
        18. gourmet food photography, macro shot, delicious, vibrant colors, soft light, depth of field, appetizing <-- **طعام**
        19. candid street photography, shot on Leica M11, dynamic composition, moody, black and white, high contrast <-- **تصوير شارع**
        20. aerial drone shot, top-down view, landscape photography, high altitude, 4k, vibrant colors <-- **مناظر طبيعية/جوية**
        21. cyberpunk style, neon-drenched city, futuristic, blade runner aesthetic, glowing lights, dark, moody <-- **مستقبلي**
        22. 16-bit pixel art, retro video game style, vibrant color palette, detailed sprites <-- **فن ألعاب الفيديو**
        23. detailed pencil sketch, hand-drawn, black and white, hatching, intricate lines, concept art <-- **رسم تخطيطي**
        24. isometric 3d render, cute, low poly, vibrant, diorama, blender 3d <-- **3D بسيط/لطيف**
        25. classic disney animation style, beautiful painted background, vibrant colors, detailed, official concept art <-- **رسوم متحركة كلاسيكية**
        26. cinematic, dramatic lighting, epic, photo, realistic <-- **عام/سينمائي**

        **OUTPUT:**
        Return ONLY the string of keywords for the selected style.
        ` 
    },
    {
        id: "generate_batch_scene_prompts",
        name: "توليد برومبتات دفعة (Batch Prompts)",
        description: "توليد أوصاف بصرية لمجموعة مشاهد في طلب واحد.",
        category: "Vision",
        variables: ["segmentsJson", "style"],
        template: `
        **ROLE:** AI Visual Director.
        **TASK:** Generate English image prompts for specific video scenes.

        **INPUT SEGMENTS (JSON):**
        {segmentsJson}

        **ART STYLE:**
        {style}

        **INSTRUCTIONS:**
        1. For EACH segment, write a prompt in this structure: "[Scene Description], {style}, [Lighting/Mood], [Technical Specs]".
        2. Ensure the Technical Specs include: "Unreal Engine 5 Render, 8k, no text".
        3. Keep the prompt descriptive but concise.

        **OUTPUT FORMAT:**
        Return a valid JSON ARRAY of strings.
        `
    },
    {
        id: "generate_marketing_package",
        name: "حزمة التسويق الشاملة (The Marketer)",
        description: "توليد الميتاداتا، الشورتس، وتيك توك في طلب واحد.",
        category: "Optimization",
        variables: ["script", "language"],
        template: `
**ROLE:** Viral Marketing Strategist.
**INPUT:** A video script.
**TASK:** Generate a complete marketing package based on the script.

**TARGET LANGUAGE:** {language}

**REQUIREMENTS:**
1. **YouTube Meta:** Viral Title, Description (with timestamps & hashtags), SEO Tags.
2. **Shorts Script:** Extract the most interesting fact into a 60s script (Hook -> Value -> CTA). **Write strictly in {language}. IF (and only if) the language is 'Arabic', you MUST use ONLY Modern Standard Arabic (Fusha/الفصحى) and strictly AVOID any regional dialects.** Make the last sentence of the script vaguely connect back to the first sentence to create a perfect seamless loop. STRICTLY FORBIDDEN to use any labels, brackets, or section headers like [Hook], [Value], or [CTA]. Just the spoken words.
3. **TikTok:** A punchy description with hashtags.

**OUTPUT FORMAT:**
Return a SINGLE JSON object with these EXACT keys:
{
  "metaTitle": "Viral Title",
  "metaDescription": "Full detailed description...",
  "metaKeywords": ["tag1", "tag2"],
  "shortsTitle": "Shorts Title",
  "shortsScript": "Shorts Script...",
  "shortsDescription": "Shorts Description...",
  "shortsKeywords": ["tag1"],
  "tiktokDescription": "TikTok Description..."
}
**SCRIPT:**
{script}
`
    },
    {
        id: "process_scenes_unified",
        name: "معالجة المشاهد الموحدة (تشكيل + صور)",
        description: "دمج التشكيل والوصف البصري في طلب واحد لتقليل استهلاك الـ API.",
        category: "Production",
        variables: ["segmentsJson", "style"],
        template: `
**Role:** Post-Production AI Engine.
**Task:** Process the following video script segments containing raw Arabic text.
**Visual Style:** {style}

**Input Segments:**
{segmentsJson}

**Requirements:**
1. **Tashkeel Processing:**
   - **IF THE TEXT IS ARABIC:** Add full Arabic diacritics (Harakat/Tashkeel).
   - **IF THE TEXT IS NOT ARABIC:** This is a CRITICAL instruction. You MUST return the original text character-for-character in the "tashkeel" field. DO NOT translate it. DO NOT add diacritics. DO NOT change it in any way.
2. **Context & Material Adaptation (CRITICAL):**
   - **Step 1: Detect Genre:** Analyze the input text to determine the era and theme (e.g., Modern Tech/AI, Ancient History, Nature, Corporate).
   - **Step 2: Adapt Materials:** You must translate visual metaphors to match the detected genre:
     - **IF TECH/MODERN:** Use materials like **Glass, Concrete, Brushed Metal, Neon, Server Racks, Fiber Optics**. (STRICTLY FORBIDDEN: Ancient stone, bricks, torches, old wood).
     - **IF HISTORY/MYTH:** Use Stone, Marble, Ruins, Parchment, Fire.
     - **IF PSYCHOLOGY/ABSTRACT:** Use Surreal shapes, Fog, Neural patterns, Mirrors.
   - *Example:* If text says "Wall of ambition" in a Tech script, generate "A towering wall of glass servers", NOT "A brick wall".
   
3. **Visual Prompt Structure:** Write a detailed English image generation prompt following this **EXACT ORDER**:
   - **A) Subject:** Describe the scene using the **Adapted Materials** from Step 2 (Focus on Wide Shots).
   - **B) Art Style:** Inject the style keywords: "{style}" immediately after the subject.
   - **C) Enhancements:** Add "Unreal Engine 5 Render, no text" at the very end.
   - **NOTE:** Do NOT repeat keywords like "8k", "Cinematic", or "Detailed" if they are already present in the Art Style.

4. **SFX:** Suggest a one-word sound effect keyword (e.g., "wind", "click", "crowd").

**Output:** 
Return a valid JSON ARRAY. Do not use Markdown code blocks.
Structure:
[
  {
    "tashkeel": "النص المشكل",
    "visual_prompt": "Subject description..., {style}, Unreal Engine 5 Render, no text",
    "sfx": "sound_keyword"
  }
]
`
    }
];

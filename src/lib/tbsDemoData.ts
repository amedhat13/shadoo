export const TBS_SECTIONS = [
  { id: 'sec-service', label: { en: 'Service & Greeting', ar: 'الخدمة والترحيب' } },
  { id: 'sec-upsell', label: { en: 'Upselling', ar: 'البيع الإضافي' } },
  { id: 'sec-accuracy', label: { en: 'Order Accuracy', ar: 'دقة الطلب' } },
  { id: 'sec-quality', label: { en: 'Product Quality', ar: 'جودة المنتج' } },
  { id: 'sec-packaging', label: { en: 'Packaging', ar: 'التغليف' } },
];

export const TBS_PHOTO_SLOTS = [
  {
    id: 'slot-storefront',
    label: { en: 'Storefront', ar: 'واجهة الفرع' },
    hint: { en: 'Full shopfront with the TBS sign visible.', ar: 'واجهة الفرع كاملة مع ظهور لافتة TBS.' },
    required: true,
  },
  {
    id: 'slot-counter',
    label: { en: 'Order counter', ar: 'منطقة الطلب' },
    hint: { en: 'The counter and display area while ordering.', ar: 'منطقة الكاشير والعرض أثناء الطلب.' },
    required: true,
  },
  {
    id: 'slot-order',
    label: { en: 'Order received', ar: 'الطلب المستلم' },
    hint: { en: 'Your order as handed to you, before eating.', ar: 'الطلب كما تم تسليمه قبل التذوق.' },
    required: true,
  },
  {
    id: 'slot-packaging',
    label: { en: 'Packaging', ar: 'التغليف' },
    hint: { en: 'Bag, lids and packaging for takeaway.', ar: 'الكيس والأغطية والتغليف الخارجي.' },
    required: false,
  },
];

const q = (
  id: string,
  section_id: string,
  en: string,
  ar: string,
  descEn: string,
  descAr: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  section_id,
  type: 'rating' as const,
  required: true,
  max_rating: 5,
  allowNA: true,
  commentMode: 'optional' as const,
  metric_key: 'overall_score',
  text: { en, ar },
  description: { en: descEn, ar: descAr },
  suggestedComments: [] as { id: string; en: string; ar: string }[],
  ...extra,
});

export const TBS_QUESTIONS = [
  q(
    'tbs-q1',
    'sec-service',
    'Was the shopper acknowledged within 30 seconds?',
    'هل تم استقبال المتسوق خلال 30 ثانية؟',
    '1★ each: greeting within 30 sec, eye contact & smile, verbal greeting, acknowledged even if busy, felt welcomed.',
    'نجمة لكل: استقبال خلال 30 ثانية، تواصل بصري وابتسامة، تحية لفظية، الالتفات وقت الانشغال، الشعور بالترحيب.',
    {
      suggestedComments: [
        { id: 'c1', en: 'Greeted immediately', ar: 'تم الترحيب فوراً' },
        { id: 'c2', en: 'Waited with no greeting', ar: 'انتظرت دون ترحيب' },
        { id: 'c3', en: 'No eye contact', ar: 'لا يوجد تواصل بصري' },
      ],
    },
  ),
  q(
    'tbs-q2',
    'sec-service',
    'How would you rate the greeting and staff engagement?',
    'كيف تقيّم الترحيب وتفاعل الموظفين؟',
    '1★ each: warm greeting, natural smile, confident & well-groomed staff, proactive help, welcoming language.',
    'نجمة لكل: ترحيب دافئ، ابتسامة طبيعية، ثقة ومظهر لائق، مساعدة بمبادرة، لغة ترحيبية.',
    {
      suggestedComments: [
        { id: 'c1', en: 'Friendly and warm', ar: 'ودود ومرحّب' },
        { id: 'c2', en: 'Staff looked rushed', ar: 'الموظف كان مستعجلاً' },
      ],
    },
  ),
  q(
    'tbs-q3',
    'sec-service',
    "Did staff explain the menu and understand the shopper's preference?",
    'هل شرح الموظفون قائمة الطعام وفهموا تفضيلات المتسوق؟',
    '1★ each: asked about preferences, explained items accurately, recommended to fit, clear communication, non-pushy suggestions.',
    'نجمة لكل: السؤال عن التفضيلات، شرح دقيق للأصناف، توصية مناسبة، تواصل واضح، اقتراحات غير ملحّة.',
  ),
  q(
    'tbs-q4',
    'sec-accuracy',
    'Was the requested item available?',
    'هل كان الصنف المطلوب متوفراً؟',
    '1★ each: item available, staff knew availability, prompt polite notice, suitable alternative, handled professionally.',
    'نجمة لكل: توفر الصنف، معرفة الموظف بالتوفر، إبلاغ سريع ومهذب، بديل مناسب، تعامل احترافي.',
  ),
  q(
    'tbs-q5',
    'sec-accuracy',
    'If unavailable, did staff suggest a suitable alternative?',
    'إذا لم يكن متوفراً، هل اقترح الموظفون بديلاً مناسباً؟',
    '1★ each: alternative offered unprompted, close match, explained why it fits, preferences considered, handled empathetically.',
    'نجمة لكل: اقتراح بديل دون طلب، تطابق قريب، شرح سبب المناسبة، مراعاة التفضيلات، تعامل متعاطف.',
  ),
  q(
    'tbs-q6',
    'sec-upsell',
    'Did staff recommend an additional item?',
    'هل رشّح الموظفون صنفاً إضافياً؟',
    '1★ each: proactive suggestion, complementary to order, based on preference, value explained, friendly not pushy.',
    'نجمة لكل: اقتراح بمبادرة، مكمّل للطلب، مبني على التفضيل، شرح القيمة، ودّي وغير ملحّ.',
  ),
  q(
    'tbs-q7',
    'sec-upsell',
    'Was the recommendation relevant to the order?',
    'هل كان الترشيح ملائماً للطلب؟',
    '1★ each: complemented the order, matched the need, suitability explained, right timing, natural delivery.',
    'نجمة لكل: مكمّل للطلب، مطابق للحاجة، شرح المناسبة، توقيت صحيح، أسلوب طبيعي.',
  ),
  q(
    'tbs-q8',
    'sec-upsell',
    'Did staff confirm the order and any add-ons before payment?',
    'هل أكد الموظفون الطلب والإضافات قبل الدفع؟',
    '1★ each: repeated full order, confirmed add-ons, verified modifications, asked for confirmation, clear and professional.',
    'نجمة لكل: تكرار الطلب كاملاً، تأكيد الإضافات، التحقق من التعديلات، طلب التأكيد، وضوح ومهنية.',
  ),
  q(
    'tbs-q9',
    'sec-service',
    'Time to receive the order.',
    'الوقت المستغرق لاستلام الطلب.',
    '1★ each: within service-time standard, matched estimate, proactive delay updates, complete order, polite handover.',
    'نجمة لكل: ضمن معيار وقت الخدمة، مطابق للوقت المتوقع، إبلاغ بالتأخير، طلب كامل، تسليم مهذب.',
    {
      suggestedComments: [
        { id: 'c1', en: 'Served quickly', ar: 'خدمة سريعة' },
        { id: 'c2', en: 'Long wait, no update', ar: 'انتظار طويل دون إبلاغ' },
      ],
    },
  ),
  q(
    'tbs-q10',
    'sec-accuracy',
    'Was the final order correct, including add-ons?',
    'هل كان الطلب النهائي صحيحاً بما في ذلك الإضافات؟',
    '1★ each: all items matched, add-ons included, modifications fulfilled, correct quantities, nothing missing.',
    'نجمة لكل: تطابق الأصناف، إدراج الإضافات، تنفيذ التعديلات، كميات صحيحة، لا نقص.',
  ),
  q(
    'tbs-q11',
    'sec-accuracy',
    'Was there a final check before handing over the order?',
    'هل تمت مراجعة نهائية قبل تسليم الطلب؟',
    '1★ each: checked against receipt, items verified, food packed well, order name confirmed, courteous handover.',
    'نجمة لكل: المطابقة مع الفاتورة، التحقق من الأصناف، تغليف جيد، تأكيد اسم الطلب، تسليم مهذب.',
  ),
  q(
    'tbs-q12',
    'sec-quality',
    'Rate presentation, temperature and taste/quality.',
    'قيّم التقديم ودرجة الحرارة والمذاق/الجودة.',
    '1★ each: appealing presentation, correct temperature, balanced taste, fresh ingredients, met brand expectations.',
    'نجمة لكل: تقديم جذاب، حرارة صحيحة، مذاق متوازن، مكونات طازجة، مطابق لتوقعات العلامة.',
    {
      photo_slot_id: 'slot-order',
      photoRequirement: { enabled: true, triggerAnswer: 'any' as const },
      suggestedComments: [
        { id: 'c1', en: 'Fresh and hot', ar: 'طازج وساخن' },
        { id: 'c2', en: 'Served lukewarm', ar: 'تم التقديم فاتراً' },
      ],
    },
  ),
  q(
    'tbs-q13',
    'sec-packaging',
    'Was the packaging suitable and protective for takeaway?',
    'هل كان التغليف مناسباً وحامياً للطلب الخارجي؟',
    '1★ each: suitable for the item, protected from spills, secure lids and bags, napkins and cutlery included, clean and labelled.',
    'نجمة لكل: مناسب للصنف، حماية من الانسكاب، أغطية وأكياس محكمة، مناديل وأدوات، نظافة ووسم صحيح.',
    { photo_slot_id: 'slot-packaging' },
  ),
  q(
    'tbs-q14',
    'sec-quality',
    'Overall experience and likelihood to recommend TBS.',
    'التجربة الإجمالية واحتمال ترشيح TBS.',
    '1★ each: met expectations, friendly professional staff, quality as expected, worth the price, would recommend.',
    'نجمة لكل: تلبية التوقعات، طاقم ودود ومهني، جودة متوقعة، السعر يستحق، الاستعداد للترشيح.',
    { commentMode: 'required' as const },
  ),
];

export const TBS_VISITS = [
  {
    "status": "approved",
    "answers": [
      {
        "value": 3,
        "question_id": "tbs-q1"
      },
      {
        "value": 5,
        "question_id": "tbs-q2"
      },
      {
        "value": 3,
        "question_id": "tbs-q3"
      },
      {
        "value": 3,
        "question_id": "tbs-q4"
      },
      {
        "value": 3,
        "question_id": "tbs-q5"
      },
      {
        "value": 5,
        "question_id": "tbs-q6"
      },
      {
        "value": 4,
        "question_id": "tbs-q7"
      },
      {
        "value": 4,
        "question_id": "tbs-q8"
      },
      {
        "value": 2,
        "question_id": "tbs-q9"
      },
      {
        "value": 3,
        "question_id": "tbs-q10"
      },
      {
        "value": 3,
        "question_id": "tbs-q11"
      },
      {
        "value": 4,
        "question_id": "tbs-q12"
      },
      {
        "value": 4,
        "question_id": "tbs-q13"
      },
      {
        "value": 5,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-11T00:09:43.082056+00:00",
    "submitted_at": "2026-06-11T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-06-11",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 3,
        "question_id": "tbs-q1"
      },
      {
        "value": 4,
        "question_id": "tbs-q2"
      },
      {
        "value": 5,
        "question_id": "tbs-q3"
      },
      {
        "value": 2,
        "question_id": "tbs-q4"
      },
      {
        "value": 5,
        "question_id": "tbs-q5"
      },
      {
        "value": 4,
        "question_id": "tbs-q6"
      },
      {
        "value": 4,
        "question_id": "tbs-q7"
      },
      {
        "value": 3,
        "question_id": "tbs-q8"
      },
      {
        "value": 5,
        "question_id": "tbs-q9"
      },
      {
        "value": 4,
        "question_id": "tbs-q10"
      },
      {
        "value": 3,
        "question_id": "tbs-q11"
      },
      {
        "value": 3,
        "question_id": "tbs-q12"
      },
      {
        "value": 5,
        "question_id": "tbs-q13"
      },
      {
        "value": 4,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-14T00:09:43.082056+00:00",
    "submitted_at": "2026-06-14T00:54:43.082056+00:00",
    "client_rating": 4,
    "scheduled_date": "2026-06-14",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 4,
        "question_id": "tbs-q1"
      },
      {
        "value": 3,
        "question_id": "tbs-q2"
      },
      {
        "value": 5,
        "question_id": "tbs-q3"
      },
      {
        "value": 3,
        "question_id": "tbs-q4"
      },
      {
        "value": 4,
        "question_id": "tbs-q5"
      },
      {
        "value": 4,
        "question_id": "tbs-q6"
      },
      {
        "value": 5,
        "question_id": "tbs-q7"
      },
      {
        "value": 4,
        "question_id": "tbs-q8"
      },
      {
        "value": 3,
        "question_id": "tbs-q9"
      },
      {
        "value": 3,
        "question_id": "tbs-q10"
      },
      {
        "value": 4,
        "question_id": "tbs-q11"
      },
      {
        "value": 5,
        "question_id": "tbs-q12"
      },
      {
        "value": 5,
        "question_id": "tbs-q13"
      },
      {
        "value": 5,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-17T00:09:43.082056+00:00",
    "submitted_at": "2026-06-17T00:54:43.082056+00:00",
    "client_rating": 4,
    "scheduled_date": "2026-06-17",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 4,
        "question_id": "tbs-q1"
      },
      {
        "value": 4,
        "question_id": "tbs-q2"
      },
      {
        "value": 4,
        "question_id": "tbs-q3"
      },
      {
        "value": 4,
        "question_id": "tbs-q4"
      },
      {
        "value": 3,
        "question_id": "tbs-q5"
      },
      {
        "value": 4,
        "question_id": "tbs-q6"
      },
      {
        "value": 5,
        "question_id": "tbs-q7"
      },
      {
        "value": 4,
        "question_id": "tbs-q8"
      },
      {
        "value": 4,
        "question_id": "tbs-q9"
      },
      {
        "value": 3,
        "question_id": "tbs-q10"
      },
      {
        "value": 5,
        "question_id": "tbs-q11"
      },
      {
        "value": 3,
        "question_id": "tbs-q12"
      },
      {
        "value": 4,
        "question_id": "tbs-q13"
      },
      {
        "value": 5,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-20T00:09:43.082056+00:00",
    "submitted_at": "2026-06-20T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-06-20",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 4,
        "question_id": "tbs-q1"
      },
      {
        "value": 5,
        "question_id": "tbs-q2"
      },
      {
        "value": 5,
        "question_id": "tbs-q3"
      },
      {
        "value": 3,
        "question_id": "tbs-q4"
      },
      {
        "value": 2,
        "question_id": "tbs-q5"
      },
      {
        "value": 4,
        "question_id": "tbs-q6"
      },
      {
        "value": 4,
        "question_id": "tbs-q7"
      },
      {
        "value": 3,
        "question_id": "tbs-q8"
      },
      {
        "value": 5,
        "question_id": "tbs-q9"
      },
      {
        "value": 5,
        "question_id": "tbs-q10"
      },
      {
        "value": 4,
        "question_id": "tbs-q11"
      },
      {
        "value": 4,
        "question_id": "tbs-q12"
      },
      {
        "value": 4,
        "question_id": "tbs-q13"
      },
      {
        "value": 5,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-23T00:09:43.082056+00:00",
    "submitted_at": "2026-06-23T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-06-23",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 4,
        "question_id": "tbs-q1"
      },
      {
        "value": 3,
        "question_id": "tbs-q2"
      },
      {
        "value": 4,
        "question_id": "tbs-q3"
      },
      {
        "value": 4,
        "question_id": "tbs-q4"
      },
      {
        "value": 4,
        "question_id": "tbs-q5"
      },
      {
        "value": 5,
        "question_id": "tbs-q6"
      },
      {
        "value": 4,
        "question_id": "tbs-q7"
      },
      {
        "value": 3,
        "question_id": "tbs-q8"
      },
      {
        "value": 5,
        "question_id": "tbs-q9"
      },
      {
        "value": 4,
        "question_id": "tbs-q10"
      },
      {
        "value": 3,
        "question_id": "tbs-q11"
      },
      {
        "value": 2,
        "question_id": "tbs-q12"
      },
      {
        "value": 3,
        "question_id": "tbs-q13"
      },
      {
        "value": 4,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-26T00:09:43.082056+00:00",
    "submitted_at": "2026-06-26T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-06-26",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 3,
        "question_id": "tbs-q1"
      },
      {
        "value": 4,
        "question_id": "tbs-q2"
      },
      {
        "value": 5,
        "question_id": "tbs-q3"
      },
      {
        "value": 4,
        "question_id": "tbs-q4"
      },
      {
        "value": 5,
        "question_id": "tbs-q5"
      },
      {
        "value": 5,
        "question_id": "tbs-q6"
      },
      {
        "value": 2,
        "question_id": "tbs-q7"
      },
      {
        "value": 5,
        "question_id": "tbs-q8"
      },
      {
        "value": 4,
        "question_id": "tbs-q9"
      },
      {
        "value": 4,
        "question_id": "tbs-q10"
      },
      {
        "value": 4,
        "question_id": "tbs-q11"
      },
      {
        "value": 4,
        "question_id": "tbs-q12"
      },
      {
        "value": 3,
        "question_id": "tbs-q13"
      },
      {
        "value": 4,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-06-29T00:09:43.082056+00:00",
    "submitted_at": "2026-06-29T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-06-29",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 5,
        "question_id": "tbs-q1"
      },
      {
        "value": 5,
        "question_id": "tbs-q2"
      },
      {
        "value": 4,
        "question_id": "tbs-q3"
      },
      {
        "value": 4,
        "question_id": "tbs-q4"
      },
      {
        "value": 3,
        "question_id": "tbs-q5"
      },
      {
        "value": 5,
        "question_id": "tbs-q6"
      },
      {
        "value": 5,
        "question_id": "tbs-q7"
      },
      {
        "value": 4,
        "question_id": "tbs-q8"
      },
      {
        "value": 4,
        "question_id": "tbs-q9"
      },
      {
        "value": 4,
        "question_id": "tbs-q10"
      },
      {
        "value": 3,
        "question_id": "tbs-q11"
      },
      {
        "value": 5,
        "question_id": "tbs-q12"
      },
      {
        "value": 4,
        "question_id": "tbs-q13"
      },
      {
        "value": 5,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-07-02T00:09:43.082056+00:00",
    "submitted_at": "2026-07-02T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-07-02",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 4,
        "question_id": "tbs-q1"
      },
      {
        "value": 4,
        "question_id": "tbs-q2"
      },
      {
        "value": 3,
        "question_id": "tbs-q3"
      },
      {
        "value": 4,
        "question_id": "tbs-q4"
      },
      {
        "value": 5,
        "question_id": "tbs-q5"
      },
      {
        "value": 5,
        "question_id": "tbs-q6"
      },
      {
        "value": 3,
        "question_id": "tbs-q7"
      },
      {
        "value": 3,
        "question_id": "tbs-q8"
      },
      {
        "value": 4,
        "question_id": "tbs-q9"
      },
      {
        "value": 3,
        "question_id": "tbs-q10"
      },
      {
        "value": 5,
        "question_id": "tbs-q11"
      },
      {
        "value": 5,
        "question_id": "tbs-q12"
      },
      {
        "value": 5,
        "question_id": "tbs-q13"
      },
      {
        "value": 4,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-07-05T00:09:43.082056+00:00",
    "submitted_at": "2026-07-05T00:54:43.082056+00:00",
    "client_rating": 4,
    "scheduled_date": "2026-07-05",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  },
  {
    "status": "approved",
    "answers": [
      {
        "value": 4,
        "question_id": "tbs-q1"
      },
      {
        "value": 5,
        "question_id": "tbs-q2"
      },
      {
        "value": 3,
        "question_id": "tbs-q3"
      },
      {
        "value": 4,
        "question_id": "tbs-q4"
      },
      {
        "value": 4,
        "question_id": "tbs-q5"
      },
      {
        "value": 5,
        "question_id": "tbs-q6"
      },
      {
        "value": 5,
        "question_id": "tbs-q7"
      },
      {
        "value": 5,
        "question_id": "tbs-q8"
      },
      {
        "value": 4,
        "question_id": "tbs-q9"
      },
      {
        "value": 5,
        "question_id": "tbs-q10"
      },
      {
        "value": 4,
        "question_id": "tbs-q11"
      },
      {
        "value": 4,
        "question_id": "tbs-q12"
      },
      {
        "value": 4,
        "question_id": "tbs-q13"
      },
      {
        "value": 5,
        "question_id": "tbs-q14"
      }
    ],
    "started_at": "2026-07-08T00:09:43.082056+00:00",
    "submitted_at": "2026-07-08T00:54:43.082056+00:00",
    "client_rating": 5,
    "scheduled_date": "2026-07-08",
    "scheduled_time": "19:30:00",
    "purchase_amount": null,
    "scheduled_duration": 60
  }
] as const;
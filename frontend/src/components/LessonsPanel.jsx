import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

const LESSONS = [
  {
    id: 1, title: 'What is SIP?', emoji: '📈',
    summary: 'Systematic Investment Plan — invest a fixed amount monthly in mutual funds.',
    content: `A SIP (Systematic Investment Plan) lets you invest a fixed amount regularly (monthly/weekly) in mutual funds.

**How it works:**
- You invest ₹1,000/month in a mutual fund
- Units are purchased at current NAV (Net Asset Value)
- Over time, rupee-cost averaging reduces the impact of market volatility
- Compounding grows your wealth over the long term

**Example:** ₹5,000/month at 12% p.a. for 10 years → Total invested: ₹6,00,000 → Estimated value: ₹11.6 L

**Sources:** AMFI India (amfiindia.com), SEBI (sebi.gov.in)`,
  },
  {
    id: 2, title: 'Emergency Fund', emoji: '🛡️',
    summary: 'Keep 3–6 months of expenses in a liquid account.',
    content: `An emergency fund is a savings buffer for unexpected events like job loss, medical emergencies, or urgent repairs.

**Rule of thumb:** 3–6 months of monthly expenses
**Where to keep it:** High-interest savings account, Liquid Mutual Fund, or FD with sweep-in facility
**What it's NOT for:** Regular expenses, vacations, or planned purchases

**Steps to build:**
1. Calculate monthly expenses (rent + food + utilities + EMIs)
2. Multiply by 6 = your emergency fund target
3. Set aside a fixed amount monthly until you reach the target

Once built, only touch it for genuine emergencies and replenish it immediately.`,
  },
  {
    id: 3, title: 'Debt Management', emoji: '⚖️',
    summary: 'Prioritise high-interest debt. Avoid the debt spiral.',
    content: `Not all debt is bad — home loans and education loans can be investments. But high-interest debt (credit cards, personal loans) is dangerous.

**Priority order:**
1. Credit card debt (18–48% interest) — pay immediately
2. Personal loans (12–24%) — close ASAP
3. Vehicle loans (8–12%) — pay normally or prepay
4. Home loans (7–9%) — consider tax benefits before prepaying

**Avalanche method:** Pay minimum on all, put extra toward highest-interest debt first.
**Snowball method:** Pay off smallest balances first for psychological momentum.

**Rule:** Never invest in equity if you have credit card debt outstanding.`,
  },
  {
    id: 4, title: 'Risk Tolerance', emoji: '🎯',
    summary: 'Know how much market volatility you can handle emotionally and financially.',
    content: `Risk tolerance is your ability and willingness to lose money in pursuit of higher returns.

**Three profiles:**

🟢 **Conservative**
- Cannot afford to lose capital
- Prefer FD, PPF, Debt Funds
- Expected return: 6–8% p.a.
- Suitable for: 0–3 year goals, retirees, emergency funds

🟡 **Moderate**  
- Can tolerate some fluctuations
- Prefer Balanced/Hybrid Funds
- Expected return: 8–12% p.a.
- Suitable for: 3–7 year goals

🔴 **Aggressive**
- Can handle significant market swings
- Prefer Equity Mutual Funds, Direct Stocks
- Expected return: 12–15%+ p.a.
- Suitable for: 7+ year goals, wealth building

**Important:** Even aggressive investments should have an emergency fund and insurance first.`,
  },
  {
    id: 5, title: 'Mutual Funds 101', emoji: '🏦',
    summary: 'Pooled investment vehicles managed by professionals.',
    content: `A mutual fund pools money from many investors to buy a diversified portfolio of stocks, bonds, or other securities.

**Key terms:**
- **NAV:** Net Asset Value — price of one unit. Calculated daily.
- **Units:** What you buy with your investment (like shares of the fund)
- **Expense ratio:** Annual fee charged by the fund (typically 0.5–2%)
- **CAGR:** Compounded Annual Growth Rate

**Types:**
- **Equity funds** — invest in stocks. Higher risk, higher potential return.
- **Debt funds** — invest in bonds. Lower risk, stable return.
- **Hybrid/Balanced** — mix of equity and debt
- **Index funds** — track an index like Nifty 50. Low cost.

**Where to invest:** SEBI-registered mutual fund platforms, your bank, or AMC websites.
Verify AMC registration at amfiindia.com`,
  },
  {
    id: 6, title: 'PPF vs NPS', emoji: '📊',
    summary: 'Two popular government-backed retirement instruments compared.',
    content: `| Feature | PPF | NPS |
|---|---|---|
| Full name | Public Provident Fund | National Pension System |
| Lock-in | 15 years | Till age 60 |
| Annual deposit | ₹500–₹1,50,000 | Min ₹1,000/year |
| Returns | ~7.1% (govt set) | Market-linked (~10–12%) |
| Equity exposure | None | Up to 75% |
| Tax benefit | EEE (Exempt-Exempt-Exempt) | EET on annuity portion |
| Withdrawal | Full at maturity + partial after 7 yrs | 60% lump sum + 40% annuity |
| Risk | Very low | Medium |
| Best for | Conservative, assured returns | Long-term wealth, retirement corpus |

**Verdict:** PPF for assured, tax-free returns with capital safety. NPS for potentially higher corpus with equity growth.

Sources: nsiindia.gov.in, npscra.nsdl.co.in`,
  },
  {
    id: 7, title: '50-30-20 Budget Rule', emoji: '💰',
    summary: 'Divide your income: 50% needs, 30% wants, 20% savings.',
    content: `The 50-30-20 rule is a simple budgeting framework for allocating your take-home income.

**50% — Needs (Essentials)**
- Rent/EMI, groceries, utilities, insurance, minimum debt payments
- If your needs exceed 50%, look at reducing rent or debt

**30% — Wants (Lifestyle)**
- Dining out, entertainment, subscriptions, shopping, vacations
- Adjust this if you need to save more

**20% — Savings & Investments**
- Emergency fund (first priority)
- Debt repayment (above minimums)
- SIP / Retirement (PPF, NPS, Mutual Funds)
- Goal-based savings

**Example for ₹50,000/month take-home:**
- ₹25,000 → Rent + Food + Bills
- ₹15,000 → Entertainment + Lifestyle
- ₹10,000 → SIP + Emergency Fund + PPF

Adjust percentages based on your goals. In early career with high debt, temporarily shift to 60-20-20.`,
  },
  {
    id: 8, title: 'Investment Fraud Warning Signs', emoji: '🚨',
    summary: 'Recognise and avoid common investment scams.',
    content: `Investment fraud is rampant in India. Learn to spot the warning signs:

🔴 **Red Flags:**
1. **Guaranteed returns** — No legitimate investment guarantees returns. SEBI doesn't permit this.
2. **Urgency pressure** — "Invest in 24 hours or lose this opportunity"
3. **OTP/Password requests** — Banks and AMCs NEVER ask for these
4. **Unregistered advisors** — Always verify at sebi.gov.in/sebiweb/home/HomeDeptData.jsp
5. **Referral schemes** — Multi-level marketing disguised as investment
6. **Too-good-to-be-true returns** — 50% monthly returns, 200% in 3 months

**Safe practices:**
- Only invest through SEBI-registered platforms
- Verify advisor SEBI registration number
- Never share banking credentials via WhatsApp/Telegram
- Report fraud at: cybercrime.gov.in or call 1930
- SEBI SCORES: scores.sebi.gov.in for complaints`,
  },
]

function LessonCard({ lesson }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card cursor-pointer hover:shadow-md transition-shadow">
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{lesson.emoji}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{lesson.summary}</p>
            </div>
          </div>
          {open ? <ChevronUp size={18} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-400 shrink-0 mt-1" />}
        </div>
      </button>
      {open && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {lesson.content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="font-semibold text-gray-900 mt-3 mb-1">{line.slice(2, -2)}</p>
            }
            if (line.startsWith('|')) {
              return <div key={i} className="font-mono text-xs bg-gray-50 px-2 py-0.5">{line}</div>
            }
            if (line.startsWith('🔴') || line.startsWith('🟢') || line.startsWith('🟡')) {
              return <p key={i} className="mt-2 font-medium">{line}</p>
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>
            }
            if (/^\d+\./.test(line)) {
              return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
            }
            return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />
          })}
        </div>
      )}
    </div>
  )
}

export default function LessonsPanel({ lang }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
        <BookOpen className="text-blue-600" /> Financial Literacy Lessons
      </h1>
      <p className="text-sm text-gray-500 mb-6">Click any lesson to expand. All content is educational.</p>

      <div className="space-y-3">
        {LESSONS.map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Sources: SEBI (sebi.gov.in), RBI (rbi.org.in), AMFI (amfiindia.com), NSI (nsiindia.gov.in)
      </p>
    </div>
  )
}

import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I post a job?",
    answer:
      "Clients can create a job from the Jobs section of their dashboard by providing the job details, budget, skills, and other requirements.",
  },
  {
    question: "How do freelancers submit proposals?",
    answer:
      "Freelancers can browse available jobs, open a job they are interested in, and submit a proposal with their offer and relevant details.",
  },
  {
    question: "How do projects work?",
    answer:
      "Once a proposal is accepted, the client and freelancer can work through the project using milestones, deliverables, communication, and payment tracking.",
  },
  {
    question: "How are payments handled?",
    answer:
      "Payments are processed through the platform's payment system and are associated with the relevant project and milestone.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the Contact Support page to send a support request to the marketplace team.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <HelpCircle className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Answers to common questions about using Freelance Marketplace.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-xl border bg-white p-6"
          >
            <h2 className="font-semibold">{faq.question}</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
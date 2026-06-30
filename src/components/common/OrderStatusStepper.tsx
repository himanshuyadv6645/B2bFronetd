import { FiCheck } from 'react-icons/fi';

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

/** Horizontal status progress for an order. Returns null for terminal/cancelled states. */
export function OrderStatusStepper({ status }: { status: string }) {
  const idx = FLOW.indexOf(status);
  if (idx < 0) return null; // cancelled / refunded / returned

  return (
    <div className="mt-3 flex items-center">
      {FLOW.map((step, i) => {
        const done = i <= idx;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${done ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'}`}>
                {done ? <FiCheck className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`mt-1 hidden text-[10px] capitalize sm:block ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
            </div>
            {i < FLOW.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < idx ? 'bg-brand' : 'bg-muted'}`} />}
          </div>
        );
      })}
    </div>
  );
}

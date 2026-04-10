import { useNavigate } from "react-router-dom";

export default function RuleBook() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a140f] text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-[#241c15] border border-[#3d2b1f] rounded-2xl p-6 shadow-xl">

        <h1 className="text-3xl font-bold mb-6 text-center text-[#d4700a]">
          📜 Game Rules
        </h1>

        {/* RULE 1 */}
        <div className="mb-6">
          <img src="/rule1.png" className="rounded-xl mb-2 w-full" />
          <p className="text-[#f0d9b5]">
            Reach the opposite side of the board before your opponent.
          </p>
        </div>

         {/* RULE 2 */}
        <div className="mb-6">
          <img src="/rule2.png" className="rounded-xl mb-2 w-full" />
          <p className="text-[#f0d9b5]">
            Can go right, left , up and down.
          </p>
        </div>

        {/* RULE 3 */}
        <div className="mb-6">
          <img src="/rule3.png" className="rounded-xl mb-2 w-full" />
          <p className="text-[#f0d9b5]">
            Place walls strategically to block your opponent’s path.
          </p>
        </div>

        {/* RULE 4 */}
        <div className="mb-6">
          <img src="/rule4.png" className="rounded-xl mb-2 w-full" />
          <p className="text-[#f0d9b5]">
            You must always leave at least one path open for opponent.
          </p>
        </div>
                {/* RULE 5 */}
        <div className="mb-6">
          <img src="/rule5.png" className="rounded-xl mb-2 w-full" />
          <p className="text-[#f0d9b5]">
            It is possible to jump over the opponent if he blocked your path.
          </p>
        </div>

        {/* OK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-[#d4700a] hover:bg-[#f08a1c] py-3 rounded-xl font-bold"
        >
          OK
        </button>

      </div>
    </div>
  );
}
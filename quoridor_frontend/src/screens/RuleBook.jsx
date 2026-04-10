import { useNavigate } from "react-router-dom";

export default function RuleBook() {
  const navigate = useNavigate();

  const rules = [
    {
      img: "/rule1.png",
      text: "Reach the opposite side of the board before your opponent to win."
    },
    {
      img: "/rule2.png",
      text: "You can move up, down, left, or right."
    },
    {
      img: "/rule3.png",
      text: "Place walls strategically to block your opponent’s path."
    },
    {
      img: "/rule5.png",
      text: "You must always leave at least one path open for your opponent."
    },
    {
      img: "/rule4.png",
      text: "You can jump over your opponent if they block your path."
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a140f] text-white px-6 py-10">
      
      <div className="max-w-6xl mx-auto">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold mb-12 text-center text-[#d4700a]">
          📜 Game Rules
        </h1>

        {/* RULES */}
        <div className="flex flex-col gap-16">

          {rules.map((rule, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-10"
            >

              {/* LEFT TEXT */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-[#d4700a] mb-4">
                  Rule {index + 1}
                </h2>
                <p className="text-lg text-[#f0d9b5] leading-relaxed">
                  {rule.text}
                </p>
              </div>

              {/* RIGHT IMAGE */}
              <div className="flex-1">
                <img
                  src={rule.img}
                  alt={`rule-${index}`}
                  className="w-full max-h-[350px] object-contain rounded-xl"
                />
              </div>

            </div>
          ))}

        </div>

        {/* OK BUTTON */}
        <button
          onClick={() => navigate("/home")}
          className="w-full bg-[#d4700a] hover:bg-[#f08a1c] py-4 rounded-xl font-bold mt-12 text-lg"
        >
          OK
        </button>

      </div>
    </div>
  );
}
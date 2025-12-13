import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Lightbulb, Compass, Heart } from "lucide-react";

export default function MissionVision() {
  return (
    <section className="container mx-auto px-4 py-16 text-white">
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-cyan-400">
                <Target className="h-6 w-6" />
                使命与愿景 (WHY)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <Heart className="h-5 w-5 text-pink-400" />
                  使命 (Purpose)
                </h3>
                <p className="text-white/70">
                  陪伴每一个人，在成长的每个阶段，成为更完整的自己。
                </p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  愿景 (Vision)
                </h3>
                <p className="text-white/70">
                  打造一个拥有温度与智慧的 AI 成长伙伴系统，让每个人都能通过与“小杏仁”的互动，理解自己、整理自己、行动于自己。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-violet-400">
                <Compass className="h-6 w-6" />
                战略定位 (WHAT)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">定位一句话</h3>
                <p className="text-xl font-medium text-cyan-400">
                  小杏仁 —— 你的 AI 成长伙伴。
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">价值主张</h3>
                <p className="text-white/70">
                  它不是帮你整理过去，而是陪你走向更好的自己。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

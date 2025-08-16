import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Achievement } from "@/lib/types";

interface AchievementsProps {
  achievements: Achievement[];
}

const colorVariants = {
  yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
  purple: "from-purple-50 to-purple-100 border-purple-200", 
  green: "from-green-50 to-green-100 border-green-200",
  blue: "from-blue-50 to-blue-100 border-blue-200",
};

const iconColorVariants = {
  yellow: "from-yellow-400 to-yellow-500",
  purple: "from-purple-400 to-purple-500",
  green: "from-green-400 to-green-500", 
  blue: "from-blue-400 to-blue-500",
};

const textColorVariants = {
  yellow: "text-yellow-800",
  purple: "text-purple-800",
  green: "text-green-800",
  blue: "text-blue-800",
};

const subtextColorVariants = {
  yellow: "text-yellow-600",
  purple: "text-purple-600", 
  green: "text-green-600",
  blue: "text-blue-600",
};

export default function Achievements({ achievements }: AchievementsProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold text-black mb-4">Son Başarılar</h3>
      <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Decorative top stripe */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const bgColor = colorVariants[achievement.color as keyof typeof colorVariants] || colorVariants.blue;
              const iconColor = iconColorVariants[achievement.color as keyof typeof iconColorVariants] || iconColorVariants.blue;
              const textColor = textColorVariants[achievement.color as keyof typeof textColorVariants] || textColorVariants.blue;
              const subtextColor = subtextColorVariants[achievement.color as keyof typeof subtextColorVariants] || subtextColorVariants.blue;
              
              return (
                <motion.div
                  key={achievement.id}
                  className={`text-center p-4 rounded-xl bg-gradient-to-br ${bgColor} border`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-full flex items-center justify-center mx-auto mb-2`}
                    whileHover={{ rotate: 10 }}
                  >
                    <i className={`${achievement.icon} text-white`}></i>
                  </motion.div>
                  <div className={`text-sm font-medium ${textColor}`}>{achievement.name}</div>
                  <div className={`text-xs ${subtextColor}`}>{achievement.description}</div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

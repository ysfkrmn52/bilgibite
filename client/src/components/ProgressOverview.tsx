import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CircleHelp, CheckCircle, Clock, Percent } from "lucide-react";

interface ProgressOverviewProps {
  stats: {
    questionsAnswered: number;
    correctAnswers: number;
    studyTime: number;
    accuracy: number;
  };
}

const statItems = [
  {
    key: "questionsAnswered",
    label: "Soru Çözüldü",
    icon: CircleHelp,
    color: "from-primary/20 to-primary/30",
    iconColor: "text-primary",
  },
  {
    key: "correctAnswers", 
    label: "Doğru Cevap",
    icon: CheckCircle,
    color: "from-success/20 to-success/30",
    iconColor: "text-success",
  },
  {
    key: "studyTime",
    label: "Saat Çalışma",
    icon: Clock,
    color: "from-secondary/20 to-secondary/30", 
    iconColor: "text-secondary",
    format: (value: number) => `${value.toFixed(1)}`,
  },
  {
    key: "accuracy",
    label: "Başarı Oranı",
    icon: Percent,
    color: "from-accent/20 to-accent/30",
    iconColor: "text-accent",
    format: (value: number) => `${value}%`,
  },
];

export default function ProgressOverview({ stats }: ProgressOverviewProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Haftalık İlerleme</h3>
      <Card className="bg-white dark:bg-gray-800 shadow-sm card-hover border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.map((item, index) => {
              const IconComponent = item.icon;
              const value = stats[item.key as keyof typeof stats];
              const displayValue = item.format ? item.format(value) : value.toString();
              
              return (
                <motion.div
                  key={item.key}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`stat-${item.key}`}
                >
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <IconComponent className={`${item.iconColor} text-xl`} />
                  </motion.div>
                  <motion.div 
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {displayValue}
                  </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

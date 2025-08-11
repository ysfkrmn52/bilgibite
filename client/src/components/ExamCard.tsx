import { motion } from "framer-motion";
import { ExamCategory } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExamCardProps {
  category: ExamCategory;
  progress: number;
  onStart: (categoryId: string) => void;
  badge?: string;
  index: number;
}

const colorVariants = {
  blue: "from-blue-500 to-blue-600",
  green: "from-primary to-green-600", 
  orange: "from-accent to-orange-600",
};

const badgeVariants = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  orange: "bg-orange-100 text-orange-800",
};

export default function ExamCard({ category, progress, onStart, badge, index }: ExamCardProps) {
  const colorGradient = colorVariants[category.color as keyof typeof colorVariants] || colorVariants.blue;
  const badgeColor = badgeVariants[category.color as keyof typeof badgeVariants] || badgeVariants.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      data-testid={`exam-card-${category.slug}`}
    >
      <Card className="bg-white dark:bg-gray-800 shadow-sm card-hover cursor-pointer h-full border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-xl flex items-center justify-center`}
              whileHover={{ rotate: 5 }}
            >
              <i className={`${category.icon} text-white text-lg`}></i>
            </motion.div>
            {badge && (
              <motion.div
                className="floating-badge"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Badge className={badgeColor} data-testid={`badge-${category.slug}`}>
                  {badge}
                </Badge>
              </motion.div>
            )}
          </div>
          
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{category.name}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{category.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
              <span className="font-medium text-gray-900 dark:text-white" data-testid={`progress-${category.slug}`}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Button
            className={`w-full bg-gradient-to-r ${colorGradient} text-white font-medium btn-primary`}
            onClick={() => onStart(category.id)}
            data-testid={`button-start-${category.slug}`}
          >
            Çalışmaya Başla
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

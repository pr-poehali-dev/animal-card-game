import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface Animal {
  id: string;
  name: string;
  emoji: string;
  food: string;
  foodEmoji: string;
  fact: string;
}

const ANIMALS: Animal[] = [
  { id: '1', name: 'Панда', emoji: '🐼', food: 'Бамбук', foodEmoji: '🎋', fact: 'Панды едят бамбук до 12 часов в день!' },
  { id: '2', name: 'Пчела', emoji: '🐝', food: 'Нектар', foodEmoji: '🌸', fact: 'Пчёлы собирают нектар и делают мёд!' },
  { id: '3', name: 'Кролик', emoji: '🐰', food: 'Морковка', foodEmoji: '🥕', fact: 'Кролики любят свежие овощи!' },
  { id: '4', name: 'Коала', emoji: '🐨', food: 'Эвкалипт', foodEmoji: '🌿', fact: 'Коалы спят до 22 часов в день!' },
  { id: '5', name: 'Обезьяна', emoji: '🐵', food: 'Банан', foodEmoji: '🍌', fact: 'Обезьяны очень умные и ловкие!' },
  { id: '6', name: 'Кот', emoji: '🐱', food: 'Рыба', foodEmoji: '🐟', fact: 'Кошки - отличные охотники!' },
  { id: '7', name: 'Жираф', emoji: '🦒', food: 'Листья', foodEmoji: '🍃', fact: 'Жирафы могут дотянуться до самых высоких веток!' },
  { id: '8', name: 'Слон', emoji: '🐘', food: 'Трава', foodEmoji: '🌾', fact: 'Слоны едят до 150 кг растений в день!' },
  { id: '9', name: 'Медведь', emoji: '🐻', food: 'Мёд', foodEmoji: '🍯', fact: 'Медведи обожают сладкий мёд!' },
  { id: '10', name: 'Белка', emoji: '🐿️', food: 'Орехи', foodEmoji: '🌰', fact: 'Белки запасают орехи на зиму!' },
  { id: '11', name: 'Енот', emoji: '🦝', food: 'Ягоды', foodEmoji: '🫐', fact: 'Еноты моют свою еду перед едой!' },
  { id: '12', name: 'Лиса', emoji: '🦊', food: 'Мышь', foodEmoji: '🐭', fact: 'Лисы - хитрые охотники!' },
  { id: '13', name: 'Корова', emoji: '🐮', food: 'Сено', foodEmoji: '🌱', fact: 'Коровы дают нам молоко!' },
  { id: '14', name: 'Курица', emoji: '🐔', food: 'Зерно', foodEmoji: '🌾', fact: 'Курицы несут яйца каждый день!' },
  { id: '15', name: 'Пингвин', emoji: '🐧', food: 'Креветки', foodEmoji: '🦐', fact: 'Пингвины отличные пловцы!' },
];

type GameMode = 'menu' | 'learn' | 'play';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameStats {
  totalGames: number;
  totalStars: number;
  bestStreak: number;
  completedLevels: { easy: number; medium: number; hard: number };
}

const loadStats = (): GameStats => {
  const saved = localStorage.getItem('animalGameStats');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    totalGames: 0,
    totalStars: 0,
    bestStreak: 0,
    completedLevels: { easy: 0, medium: 0, hard: 0 }
  };
};

const saveStats = (stats: GameStats) => {
  localStorage.setItem('animalGameStats', JSON.stringify(stats));
};

export default function Index() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentAnimals, setCurrentAnimals] = useState<Animal[]>([]);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [learnIndex, setLearnIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>(loadStats());

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const count = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 6;
    const shuffled = shuffleArray([...ANIMALS]);
    const selected = shuffled.slice(0, count);
    setCurrentAnimals(shuffleArray([...selected]));
    setMatches(new Set());
    setSelectedAnimal(null);
    setStars(0);
    setShowHint(false);
    setMode('play');
  };

  const handleAnimalClick = (animalId: string) => {
    if (matches.has(animalId)) return;
    setSelectedAnimal(animalId);
  };

  const handleFoodClick = (animalId: string) => {
    if (!selectedAnimal || matches.has(selectedAnimal)) return;
    
    if (selectedAnimal === animalId) {
      const newMatches = new Set(matches);
      newMatches.add(animalId);
      setMatches(newMatches);
      setSelectedAnimal(null);
      setStars(stars + 1);
      
      if (newMatches.size === currentAnimals.length) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        setStats(prev => ({
          totalGames: prev.totalGames + 1,
          totalStars: prev.totalStars + stars + 1,
          bestStreak: Math.max(prev.bestStreak, stars + 1),
          completedLevels: {
            ...prev.completedLevels,
            [difficulty]: prev.completedLevels[difficulty] + 1
          }
        }));
      }
    } else {
      setSelectedAnimal(null);
    }
  };

  const handleHint = () => {
    if (selectedAnimal) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
    }
  };

  const progress = currentAnimals.length > 0 ? (matches.size / currentAnimals.length) * 100 : 0;

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF7CD] via-[#FFDEE2] to-[#E5DEFF] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 animate-bounce-in">
            <h1 className="text-4xl sm:text-6xl font-bold text-[#1A1F2C] mb-4">
              🦁 Кто что ест? 🍎
            </h1>
            <p className="text-xl sm:text-2xl text-[#555555]">Развивающая игра для детей</p>
          </div>

          <Card className="p-6 bg-white/90 backdrop-blur shadow-xl mb-6 animate-bounce-in">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#1A1F2C] mb-4">📊 Твоя статистика</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7E69AB] p-4 rounded-xl text-white">
                  <div className="text-3xl font-bold">{stats.totalGames}</div>
                  <div className="text-sm">Игр сыграно</div>
                </div>
                <div className="bg-gradient-to-br from-[#F97316] to-[#ea6a0f] p-4 rounded-xl text-white">
                  <div className="text-3xl font-bold">{stats.totalStars}</div>
                  <div className="text-sm">Всего звёзд</div>
                </div>
                <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0c8fc7] p-4 rounded-xl text-white">
                  <div className="text-3xl font-bold">{stats.bestStreak}</div>
                  <div className="text-sm">Лучшая серия</div>
                </div>
                <div className="bg-gradient-to-br from-[#22c55e] to-[#16a34a] p-4 rounded-xl text-white">
                  <div className="text-3xl font-bold">{Object.values(stats.completedLevels).reduce((a, b) => a + b, 0)}</div>
                  <div className="text-sm">Уровней пройдено</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur hover:scale-105 transition-transform cursor-pointer shadow-xl" onClick={() => setMode('learn')}>
              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-4 animate-float">📚</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] mb-2">Обучение</h2>
                <p className="text-base sm:text-lg text-[#555555]">Изучи всех {ANIMALS.length} животных!</p>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur hover:scale-105 transition-transform cursor-pointer shadow-xl">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-4 animate-float" style={{ animationDelay: '0.5s' }}>🎮</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] mb-4">Играть</h2>
                <div className="space-y-3">
                  <Button onClick={() => startGame('easy')} className="w-full text-lg sm:text-xl py-4 sm:py-6 bg-[#8B5CF6] hover:bg-[#7E69AB]">
                    <Icon name="Star" className="mr-2" /> Легко (3 пары)
                  </Button>
                  <Button onClick={() => startGame('medium')} className="w-full text-lg sm:text-xl py-4 sm:py-6 bg-[#0EA5E9] hover:bg-[#0c8fc7]">
                    <Icon name="Zap" className="mr-2" /> Средне (4 пары)
                  </Button>
                  <Button onClick={() => startGame('hard')} className="w-full text-lg sm:text-xl py-4 sm:py-6 bg-[#F97316] hover:bg-[#ea6a0f]">
                    <Icon name="Flame" className="mr-2" /> Сложно (6 пар)
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'learn') {
    const animal = ANIMALS[learnIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF7CD] via-[#FFDEE2] to-[#E5DEFF] p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => setMode('menu')} variant="outline" className="mb-6 text-base sm:text-lg">
            <Icon name="Home" className="mr-2" /> На главную
          </Button>

          <Card className="p-6 sm:p-12 bg-white/90 backdrop-blur shadow-xl animate-bounce-in">
            <div className="text-center mb-8">
              <div className="text-7xl sm:text-9xl mb-6 animate-float">{animal.emoji}</div>
              <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1F2C] mb-4">{animal.name}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-2xl sm:text-4xl mb-6">
                <span>ест</span>
                <div className="text-5xl sm:text-7xl animate-wiggle">{animal.foodEmoji}</div>
                <span className="font-bold text-[#F97316]">{animal.food}</span>
              </div>
              <p className="text-lg sm:text-2xl text-[#555555] bg-[#FEF7CD] p-4 sm:p-6 rounded-2xl">{animal.fact}</p>
            </div>

            <div className="flex justify-between items-center">
              <Button 
                onClick={() => setLearnIndex(Math.max(0, learnIndex - 1))}
                disabled={learnIndex === 0}
                className="text-base sm:text-xl py-4 sm:py-6 px-4 sm:px-8"
                variant="outline"
              >
                <Icon name="ChevronLeft" className="sm:mr-2" />
                <span className="hidden sm:inline">Назад</span>
              </Button>
              <span className="text-lg sm:text-xl text-[#555555]">{learnIndex + 1} / {ANIMALS.length}</span>
              <Button 
                onClick={() => setLearnIndex(Math.min(ANIMALS.length - 1, learnIndex + 1))}
                disabled={learnIndex === ANIMALS.length - 1}
                className="text-base sm:text-xl py-4 sm:py-6 px-4 sm:px-8"
              >
                <span className="hidden sm:inline">Дальше</span>
                <Icon name="ChevronRight" className="sm:ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const foodOrder = shuffleArray([...currentAnimals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF7CD] via-[#FFDEE2] to-[#E5DEFF] p-4 sm:p-8 relative overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl sm:text-4xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['⭐', '🎉', '🌟', '✨', '🎊'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <Button onClick={() => setMode('menu')} variant="outline" className="text-base sm:text-lg w-full sm:w-auto">
            <Icon name="Home" className="mr-2" /> Меню
          </Button>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
            <div className="flex gap-1">
              {[...Array(currentAnimals.length)].map((_, i) => (
                <div key={i} className={`text-2xl sm:text-4xl ${i < stars ? 'animate-sparkle' : 'opacity-30'}`}>
                  ⭐
                </div>
              ))}
            </div>
            <Button onClick={handleHint} variant="outline" disabled={!selectedAnimal} className="text-base sm:text-lg">
              <Icon name="Lightbulb" className="mr-2" /> 
              <span className="hidden sm:inline">Подсказка</span>
            </Button>
          </div>
        </div>

        <Progress value={progress} className="mb-8 h-3 sm:h-4" />

        {matches.size === currentAnimals.length ? (
          <Card className="p-8 sm:p-12 bg-white/90 backdrop-blur shadow-xl text-center animate-bounce-in">
            <div className="text-7xl sm:text-9xl mb-6">🎉</div>
            <h2 className="text-4xl sm:text-6xl font-bold text-[#1A1F2C] mb-4">Молодец!</h2>
            <p className="text-xl sm:text-3xl text-[#555555] mb-8">Ты соединил все пары правильно!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => startGame(difficulty)} className="text-xl sm:text-2xl py-6 sm:py-8 px-8 sm:px-12">
                <Icon name="RotateCcw" className="mr-2" /> Играть ещё
              </Button>
              <Button onClick={() => setMode('menu')} variant="outline" className="text-xl sm:text-2xl py-6 sm:py-8 px-8 sm:px-12">
                <Icon name="Home" className="mr-2" /> В меню
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] mb-4 sm:mb-6 text-center">Животные</h3>
              <div className="space-y-3 sm:space-y-4">
                {currentAnimals.map((animal) => (
                  <Card
                    key={animal.id}
                    onClick={() => handleAnimalClick(animal.id)}
                    className={`p-4 sm:p-8 cursor-pointer transition-all shadow-lg ${
                      matches.has(animal.id)
                        ? 'bg-green-200 opacity-50 cursor-not-allowed'
                        : selectedAnimal === animal.id
                        ? 'bg-[#8B5CF6] text-white scale-105 shadow-2xl'
                        : 'bg-white hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="text-5xl sm:text-7xl">{animal.emoji}</div>
                      <div className="text-xl sm:text-3xl font-bold">{animal.name}</div>
                      {matches.has(animal.id) && <div className="ml-auto text-3xl sm:text-5xl">✅</div>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] mb-4 sm:mb-6 text-center">Еда</h3>
              <div className="space-y-3 sm:space-y-4">
                {foodOrder.map((animal) => (
                  <Card
                    key={animal.id}
                    onClick={() => handleFoodClick(animal.id)}
                    className={`p-4 sm:p-8 cursor-pointer transition-all shadow-lg ${
                      matches.has(animal.id)
                        ? 'bg-green-200 opacity-50 cursor-not-allowed'
                        : showHint && selectedAnimal === animal.id
                        ? 'bg-yellow-300 animate-wiggle'
                        : 'bg-white hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="text-5xl sm:text-7xl">{animal.foodEmoji}</div>
                      <div className="text-xl sm:text-3xl font-bold">{animal.food}</div>
                      {matches.has(animal.id) && <div className="ml-auto text-3xl sm:text-5xl">✅</div>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
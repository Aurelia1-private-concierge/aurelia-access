import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, DollarSign, Globe, Sparkles, MapPin, Thermometer, Wind, Droplets, Sun, TrendingUp, Plane, Heart, Wine, Gem, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useSmartIntegrations } from '@/hooks/useSmartIntegrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobal } from '@/contexts/GlobalContext';
const SmartIntegrationsHub: React.FC = () => {
  const {
    isLoading,
    weatherData,
    currencyData,
    countryData,
    aiInsight,
    fetchWeather,
    convertCurrency,
    fetchCountryInfo,
    getAIInsight,
    getUserLocation
  } = useSmartIntegrations();
  const {
    formatCurrency: formatCurrencyGlobal
  } = useGlobal();
  const [cityInput, setCityInput] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');
  const [countryInput, setCountryInput] = useState('');
  const [activeInsightType, setActiveInsightType] = useState<'travel' | 'wellness' | 'lifestyle' | 'investment'>('travel');
  const handleWeatherSearch = async () => {
    if (cityInput.trim()) {
      await fetchWeather({
        city: cityInput
      });
    }
  };
  const handleLocationWeather = async () => {
    try {
      const location = await getUserLocation();
      await fetchWeather(location);
    } catch (error) {
      console.error('Location error:', error);
    }
  };
  const handleCurrencyConvert = async () => {
    await convertCurrency(fromCurrency, toCurrency, parseFloat(amount) || 1);
  };
  const handleCountrySearch = async () => {
    if (countryInput.trim()) {
      await fetchCountryInfo(countryInput);
    }
  };
  const handleGetInsight = async () => {
    await getAIInsight(activeInsightType);
  };
  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-8 h-8 text-primary" />;
    if (code <= 48) return <Cloud className="w-8 h-8 text-muted-foreground" />;
    if (code <= 67) return <Droplets className="w-8 h-8 text-blue-400" />;
    return <Cloud className="w-8 h-8 text-muted-foreground" />;
  };
  return <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-16">
          <span className="text-primary/80 text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
            Smart Services
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Intelligent <span className="text-primary">Integrations</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time data and AI-powered insights to enhance your lifestyle decisions
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="weather" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 bg-card/50 border border-border/50">
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline text-silver">Currency</span>
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Countries</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Weather Tab */}
          <TabsContent value="weather">
            <Card className="bg-card/30 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-primary" />
                  Weather Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <Input placeholder="Enter city (e.g., Monaco, Tokyo, Dubai)" value={cityInput} onChange={e => setCityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleWeatherSearch()} className="flex-1" />
                  <Button onClick={handleWeatherSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                  <Button variant="outline" onClick={handleLocationWeather} disabled={isLoading} aria-label="Use my current location">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {weatherData && <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} className="grid md:grid-cols-2 gap-6">
                      {/* Current Weather */}
                      <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Weather</p>
                            <p className="text-4xl font-light text-foreground">
                              {Math.round(weatherData.current.temperature)}°C
                            </p>
                            <p className="text-muted-foreground">{weatherData.current.description}</p>
                          </div>
                          {getWeatherIcon(0)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-primary" />
                            <span>Feels {Math.round(weatherData.current.feels_like)}°</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <span>{weatherData.current.humidity}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="w-4 h-4 text-muted-foreground" />
                            <span>{Math.round(weatherData.current.wind_speed)} km/h</span>
                          </div>
                        </div>
                      </div>

                      {/* Forecast */}
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground mb-3">7-Day Forecast</p>
                        {weatherData.forecast.slice(0, 5).map((day, i) => <div key={i} className="flex items-center justify-between p-2 rounded bg-card/50">
                            <span className="text-sm text-muted-foreground w-20">
                              {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short'
                        })}
                            </span>
                            <span className="text-sm flex-1 text-center">{day.description}</span>
                            <span className="text-sm w-16 text-right">
                              {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
                            </span>
                          </div>)}
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency Tab */}
          <TabsContent value="currency">
            <Card className="bg-card/30 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Currency Exchange
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-4 gap-3">
                  <Input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                  <Input placeholder="From (USD)" value={fromCurrency} onChange={e => setFromCurrency(e.target.value.toUpperCase())} maxLength={3} />
                  <Input placeholder="To (EUR)" value={toCurrency} onChange={e => setToCurrency(e.target.value.toUpperCase())} maxLength={3} />
                  <Button onClick={handleCurrencyConvert} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert'}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {currencyData && <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }}>
                      <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center mb-6">
                        <p className="text-sm text-muted-foreground mb-2">
                          {currencyData.amount.toLocaleString()} {currencyData.base}
                        </p>
                        <p className="text-4xl font-light text-primary">
                          {currencyData.conversions[toCurrency]?.toLocaleString() || 'N/A'} {toCurrency}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Rate: 1 {currencyData.base} = {currencyData.rates[toCurrency]?.toFixed(4)} {toCurrency}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(currencyData.conversions).slice(0, 8).map(([currency, value]) => <div key={currency} className="p-3 rounded bg-card/50 text-center">
                            <p className="text-xs text-muted-foreground">{currency}</p>
                            <p className="text-sm font-medium">{value.toLocaleString()}</p>
                          </div>)}
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Countries Tab */}
          <TabsContent value="countries">
            <Card className="bg-card/30 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Country Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <Input placeholder="Enter country name (e.g., Japan, Monaco, Switzerland)" value={countryInput} onChange={e => setCountryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCountrySearch()} className="flex-1" />
                  <Button onClick={handleCountrySearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {countryData && <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                        <div className="flex items-start gap-4 mb-4">
                          {countryData.flag && <img src={countryData.flag} alt={`${countryData.name} flag`} className="w-16 h-12 object-cover rounded shadow-lg" />}
                          <div>
                            <h3 className="text-xl font-serif text-foreground">{countryData.name}</h3>
                            <p className="text-sm text-muted-foreground">{countryData.official_name}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Capital:</span> {countryData.capital || 'N/A'}</p>
                          <p><span className="text-muted-foreground">Region:</span> {countryData.region} / {countryData.subregion}</p>
                          <p><span className="text-muted-foreground">Population:</span> {countryData.population?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded bg-card/50">
                          <p className="text-xs text-muted-foreground mb-2">Currencies</p>
                          <div className="flex flex-wrap gap-2">
                            {countryData.currencies.map(c => <span key={c.code} className="px-2 py-1 rounded bg-primary/10 text-primary text-sm">
                                {c.symbol} {c.code} - {c.name}
                              </span>)}
                          </div>
                        </div>
                        <div className="p-4 rounded bg-card/50">
                          <p className="text-xs text-muted-foreground mb-2">Languages</p>
                          <div className="flex flex-wrap gap-2">
                            {countryData.languages.map(lang => <span key={lang} className="px-2 py-1 rounded bg-muted text-muted-foreground text-sm">
                                {lang}
                              </span>)}
                          </div>
                        </div>
                        <div className="p-4 rounded bg-card/50">
                          <p className="text-xs text-muted-foreground mb-2">Timezones</p>
                          <p className="text-sm text-foreground">{countryData.timezones?.join(', ')}</p>
                        </div>
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <Card className="bg-card/30 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[{
                  type: 'travel' as const,
                  icon: Plane,
                  label: 'Travel'
                }, {
                  type: 'wellness' as const,
                  icon: Heart,
                  label: 'Wellness'
                }, {
                  type: 'lifestyle' as const,
                  icon: Wine,
                  label: 'Lifestyle'
                }, {
                  type: 'investment' as const,
                  icon: Gem,
                  label: 'Investments'
                }].map(({
                  type,
                  icon: Icon,
                  label
                }) => <Button key={type} variant={activeInsightType === type ? 'default' : 'outline'} onClick={() => setActiveInsightType(type)} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </Button>)}
                </div>

                <Button onClick={handleGetInsight} disabled={isLoading} className="w-full">
                  {isLoading ? <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating Insights...
                    </> : <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate {activeInsightType.charAt(0).toUpperCase() + activeInsightType.slice(1)} Insights
                    </>}
                </Button>

                <AnimatePresence mode="wait">
                  {aiInsight && <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {aiInsight.type.charAt(0).toUpperCase() + aiInsight.type.slice(1)} Insights
                          </span>
                        </div>
                        {aiInsight.curated && <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                            Curated
                          </span>}
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                          {aiInsight.insight}
                        </div>
                      </div>
                      {aiInsight.generated_at && <p className="text-xs text-muted-foreground mt-4">
                          Generated: {new Date(aiInsight.generated_at).toLocaleString()}
                        </p>}
                    </motion.div>}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>;
};
export default SmartIntegrationsHub;
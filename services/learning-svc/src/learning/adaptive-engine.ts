import {
  AdaptiveLearningEngine,
  PersonalizationModel,
  PersonalizedContent,
  PerformanceData,
  DifficultyAdjustment,
  LearningPrediction,
  PacingRecommendation,
  LearningMaterial,
  SessionMetrics,
  PerformanceMetrics,
  DifficultyLevel,
  LearningStyle
} from '../types/index';

// ============================================================================
// ADAPTIVE LEARNING ENGINE IMPLEMENTATION
// ============================================================================

export class AdaptiveLearningEngineImpl implements AdaptiveLearningEngine {
  private personalizationModels: Map<string, PersonalizationModel> = new Map();
  private performanceThresholds = {
    excellent: 0.9,
    good: 0.75,
    average: 0.6,
    poor: 0.4
  };

  // ============================================================================
  // CONTENT PERSONALIZATION
  // ============================================================================

  async personalizeContent(userId: string, content: LearningMaterial): Promise<PersonalizedContent> {
    const model = await this.getPersonalizationModel(userId);
    const adaptationReasons: string[] = [];

    // Clone the original content for adaptation
    const adaptedContent: LearningMaterial = JSON.parse(JSON.stringify(content));

    // Adapt based on learning style
    this.adaptForLearningStyle(adaptedContent, model.learningStyle, adaptationReasons);

    // Adapt based on skill level
    this.adaptForSkillLevel(adaptedContent, model, adaptationReasons);

    // Adapt based on preferences
    this.adaptForPreferences(adaptedContent, model.preferences, adaptationReasons);

    return {
      originalContent: content,
      adaptedContent,
      adaptationReasons,
      personalizedFor: userId
    };
  }

  private adaptForLearningStyle(
    content: LearningMaterial,
    learningStyle: LearningStyle,
    reasons: string[]
  ): void {
    switch (learningStyle) {
      case 'visual':
        // Prioritize diagrams and visual elements
        if (content.content.diagrams && content.content.diagrams.length > 0) {
          reasons.push('Enhanced visual elements for visual learner');
        }
        // Add more visual examples if available
        if (content.content.code) {
          content.content.code.forEach(example => {
            if (!example.explanation.includes('visual')) {
              example.explanation = `Visual breakdown: ${example.explanation}`;
            }
          });
          reasons.push('Added visual code explanations');
        }
        break;

      case 'auditory':
        // Enhance text explanations with audio-friendly descriptions
        if (content.content.text) {
          content.content.text = this.enhanceForAuditory(content.content.text);
          reasons.push('Enhanced explanations for auditory learning');
        }
        break;

      case 'kinesthetic':
        // Prioritize interactive elements and hands-on exercises
        if (content.content.interactive && content.content.interactive.length > 0) {
          reasons.push('Prioritized interactive elements for hands-on learning');
        }
        // Suggest practical exercises
        if (content.type === 'explanation') {
          content.metadata.tags.push('hands-on-recommended');
          reasons.push('Recommended hands-on practice');
        }
        break;

      case 'mixed':
        // Ensure balanced content across all modalities
        reasons.push('Balanced multi-modal content presentation');
        break;
    }
  }

  private adaptForSkillLevel(
    content: LearningMaterial,
    model: PersonalizationModel,
    reasons: string[]
  ): void {
    const relevantSkills = content.concepts
      .map(concept => model.skillLevels.get(concept))
      .filter(skill => skill !== undefined);

    if (relevantSkills.length === 0) return;

    const averageSkill = relevantSkills.reduce((sum, skill) => sum + skill!, 0) / relevantSkills.length;

    // Adjust content complexity based on skill level
    if (averageSkill < 0.3 && content.difficulty !== 'beginner') {
      content.difficulty = 'beginner';
      reasons.push('Simplified content for current skill level');
    } else if (averageSkill > 0.8 && content.difficulty === 'beginner') {
      content.difficulty = 'intermediate';
      reasons.push('Increased complexity for advanced skill level');
    }

    // Add prerequisite reminders for low skill levels
    if (averageSkill < 0.5 && content.prerequisites.length > 0) {
      if (content.content.text) {
        content.content.text = `Prerequisites reminder: ${content.prerequisites.join(', ')}\n\n${content.content.text}`;
        reasons.push('Added prerequisite reminders');
      }
    }
  }

  private adaptForPreferences(
    content: LearningMaterial,
    preferences: any,
    reasons: string[]
  ): void {
    // Adjust estimated time based on session length preference
    if (preferences.sessionLength && content.metadata.estimatedTime > preferences.sessionLength) {
      content.metadata.tags.push('break-recommended');
      reasons.push('Recommended breaks for long content');
    }

    // Adapt difficulty preference
    if (preferences.difficultyPreference === 'challenging' && content.difficulty === 'beginner') {
      content.metadata.tags.push('challenge-mode');
      reasons.push('Enhanced for challenge preference');
    } else if (preferences.difficultyPreference === 'comfortable' && content.difficulty === 'advanced') {
      content.metadata.tags.push('comfort-mode');
      reasons.push('Simplified for comfort preference');
    }
  }

  private enhanceForAuditory(text: string): string {
    // Add verbal cues and transitions
    return text
      .replace(/\n\n/g, '\n\nNow, let\'s move on to the next point.\n\n')
      .replace(/:/g, ', which means')
      .replace(/\./g, '. Take a moment to consider this.');
  }

  // ============================================================================
  // DIFFICULTY ADJUSTMENT
  // ============================================================================

  async adjustDifficulty(userId: string, performance: PerformanceData): Promise<DifficultyAdjustment> {
    const model = await this.getPersonalizationModel(userId);
    const currentLevel = this.getCurrentDifficultyLevel(userId, performance.concept);

    // Analyze recent performance
    const recentPerformance = this.getRecentPerformance(model, performance.concept);
    const averageAccuracy = this.calculateAverageAccuracy(recentPerformance);

    let newLevel = currentLevel;
    let reason = '';
    let confidence = 0;

    // Determine if adjustment is needed
    if (averageAccuracy >= this.performanceThresholds.excellent) {
      newLevel = this.increaseDifficulty(currentLevel);
      reason = 'Excellent performance - increasing difficulty';
      confidence = 0.9;
    } else if (averageAccuracy <= this.performanceThresholds.poor) {
      newLevel = this.decreaseDifficulty(currentLevel);
      reason = 'Struggling with current level - decreasing difficulty';
      confidence = 0.8;
    } else if (averageAccuracy >= this.performanceThresholds.good) {
      // Check if user has been at this level for a while
      const timeAtLevel = this.getTimeAtCurrentLevel(model, performance.concept);
      if (timeAtLevel > 5) { // 5 sessions at current level
        newLevel = this.increaseDifficulty(currentLevel);
        reason = 'Consistent good performance - ready for next level';
        confidence = 0.7;
      }
    }

    // Consider user preferences
    if (model.preferences.difficultyPreference === 'comfortable' && newLevel > currentLevel) {
      confidence *= 0.8; // Reduce confidence for comfort-preferring users
    } else if (model.preferences.difficultyPreference === 'challenging' && newLevel < currentLevel) {
      confidence *= 0.9; // High confidence for challenge-seeking users
    }

    // Update the model with new difficulty
    this.updateDifficultyInModel(model, performance.concept, newLevel);

    return {
      fromLevel: currentLevel,
      toLevel: newLevel,
      reason,
      confidence
    };
  }

  private getCurrentDifficultyLevel(userId: string, concept: string): DifficultyLevel {
    const model = this.personalizationModels.get(userId);
    if (!model) return 'beginner';

    const mastery = model.skillLevels.get(concept) || 0;
    if (mastery < 0.3) return 'beginner';
    if (mastery < 0.6) return 'intermediate';
    if (mastery < 0.8) return 'advanced';
    return 'expert';
  }

  private increaseDifficulty(current: DifficultyLevel): DifficultyLevel {
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current;
  }

  private decreaseDifficulty(current: DifficultyLevel): DifficultyLevel {
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    return currentIndex > 0 ? levels[currentIndex - 1] : current;
  }

  private getRecentPerformance(model: PersonalizationModel, concept: string): PerformanceMetrics[] {
    // Filter performance history for this concept, specifically looking for context match if possible
    // For now, we'll just look at the last 10 entries to see if any relate to this concept
    // In a full DB implementation, we'd query by concept
    // Here we will blindly take the last 10 entries as proxy for "recent state" 
    // or filter if we had concept info in metrics (which we do if we store it properly)
    return model.performanceHistory.slice(-10);
  }

  private calculateAverageAccuracy(performance: PerformanceMetrics[]): number {
    if (performance.length === 0) return 0.5; // Default to average
    return performance.reduce((sum, p) => sum + p.accuracy, 0) / performance.length;
  }

  private getTimeAtCurrentLevel(model: PersonalizationModel, _concept: string): number {
    // Count consecutive high-performing sessions
    let streak = 0;
    for (let i = model.performanceHistory.length - 1; i >= 0; i--) {
      if (model.performanceHistory[i].accuracy > 0.7) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private updateDifficultyInModel(model: PersonalizationModel, concept: string, level: DifficultyLevel): void {
    // Map difficulty level back to a mastery score approximation for the update
    let baseMastery = 0;
    switch (level) {
      case 'beginner': baseMastery = 0.2; break;
      case 'intermediate': baseMastery = 0.5; break;
      case 'advanced': baseMastery = 0.75; break;
      case 'expert': baseMastery = 0.9; break;
    }

    // We update the skill level. In a real app we might have a separate "PreferredDifficulty" map per concept.
    // Here we update the mastery to reflect the new difficulty level setting.
    model.skillLevels.set(concept, baseMastery);
  }

  // ============================================================================
  // LEARNING OUTCOME PREDICTION
  // ============================================================================

  async predictLearningOutcome(userId: string, concept: string): Promise<LearningPrediction> {
    const model = await this.getPersonalizationModel(userId);
    const currentSkill = model.skillLevels.get(concept) || 0;
    const recentPerformance = this.getRecentPerformance(model, concept);

    // Calculate learning velocity
    const velocity = this.calculateLearningVelocity(recentPerformance);

    // Predict mastery based on current skill and velocity
    const predictedMastery = Math.min(1.0, currentSkill + (velocity * 0.1));

    // Estimate time to mastery
    const remainingMastery = 1.0 - currentSkill;
    const timeToMastery = velocity > 0 ? remainingMastery / velocity : 100; // hours

    // Generate recommended learning path
    const recommendedPath = this.generateRecommendedPath(concept, currentSkill);

    // Calculate confidence based on data quality
    const confidence = Math.min(0.9, recentPerformance.length * 0.1);

    return {
      concept,
      predictedMastery,
      timeToMastery: Math.min(timeToMastery, 100), // Cap at 100 hours
      confidence,
      recommendedPath
    };
  }

  private calculateLearningVelocity(performance: PerformanceMetrics[]): number {
    if (performance.length < 2) return 0.1; // Default velocity

    // Calculate improvement rate over time
    const first = performance[0];
    const last = performance[performance.length - 1];
    const timeDiff = (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 60 * 60); // hours
    const accuracyImprovement = last.accuracy - first.accuracy;

    return timeDiff > 0 ? accuracyImprovement / timeDiff : 0.1;
  }

  private generateRecommendedPath(concept: string, currentSkill: number): string[] {
    // Generate a learning path based on current skill level
    const basePath = [`${concept}-basics`, `${concept}-intermediate`, `${concept}-advanced`];

    if (currentSkill < 0.3) {
      return basePath;
    } else if (currentSkill < 0.7) {
      return basePath.slice(1);
    } else {
      return basePath.slice(2);
    }
  }

  // ============================================================================
  // PACING OPTIMIZATION
  // ============================================================================

  async optimizePacing(userId: string, sessionData: SessionMetrics): Promise<PacingRecommendation> {
    const model = await this.getPersonalizationModel(userId);

    // Analyze current session performance
    const engagementLevel = sessionData.engagementScore;
    const accuracyLevel = sessionData.averageAccuracy;

    let recommendedLength = model.preferences.sessionLength;
    let breakFrequency = 30; // minutes
    let contentDensity = 1.0; // normal density
    let reason = 'Maintaining current pacing';

    // Adjust based on engagement
    if (engagementLevel < 0.5) {
      recommendedLength = Math.max(15, recommendedLength * 0.8);
      breakFrequency = 20;
      contentDensity = 0.8;
      reason = 'Reduced pacing due to low engagement';
    } else if (engagementLevel > 0.8 && accuracyLevel > 0.8) {
      recommendedLength = Math.min(90, recommendedLength * 1.2);
      breakFrequency = 45;
      contentDensity = 1.2;
      reason = 'Increased pacing due to high engagement and accuracy';
    }

    // Adjust based on accuracy
    if (accuracyLevel < 0.6) {
      contentDensity *= 0.7;
      breakFrequency = Math.min(breakFrequency, 25);
      reason = 'Slowed pacing to improve comprehension';
    }

    // Consider time of day and historical patterns
    const currentHour = new Date().getHours();
    if (currentHour < 9 || currentHour > 20) {
      recommendedLength *= 0.9; // Shorter sessions outside peak hours
      reason += ' (adjusted for time of day)';
    }

    return {
      sessionLength: Math.round(recommendedLength),
      breakFrequency: Math.round(breakFrequency),
      contentDensity: Math.round(contentDensity * 100) / 100,
      reason
    };
  }

  // ============================================================================
  // PERSONALIZATION MODEL MANAGEMENT
  // ============================================================================

  async getPersonalizationModel(userId: string): Promise<PersonalizationModel> {
    let model = this.personalizationModels.get(userId);

    if (!model) {
      // Create default model for new user
      model = {
        userId,
        learningStyle: 'mixed',
        skillLevels: new Map(),
        preferences: {
          learningStyle: 'mixed',
          difficultyPreference: 'adaptive',
          sessionLength: 30,
          notificationSettings: {
            email: true,
            push: true,
            sessionReminders: true,
            progressUpdates: true,
            weeklyReports: false
          }
        },
        performanceHistory: []
      };

      this.personalizationModels.set(userId, model);
    }

    return model;
  }

  async updatePersonalizationModel(userId: string, updates: Partial<PersonalizationModel>): Promise<void> {
    const model = await this.getPersonalizationModel(userId);

    // Merge updates
    Object.assign(model, updates);

    this.personalizationModels.set(userId, model);
  }

  async addPerformanceData(userId: string, performance: PerformanceMetrics): Promise<void> {
    const model = await this.getPersonalizationModel(userId);

    // Add to performance history
    model.performanceHistory.push(performance);

    // Keep only recent history (last 100 entries)
    if (model.performanceHistory.length > 100) {
      model.performanceHistory = model.performanceHistory.slice(-100);
    }

    this.personalizationModels.set(userId, model);
  }

  // ============================================================================
  // ANALYTICS AND INSIGHTS
  // ============================================================================

  async getLearningInsights(userId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    learningVelocity: number;
    optimalStudyTime: string;
  }> {
    const model = await this.getPersonalizationModel(userId);

    // Analyze strengths and weaknesses
    const skillEntries = Array.from(model.skillLevels.entries());
    const strengths = skillEntries
      .filter(([, level]) => level > 0.8)
      .map(([concept]) => concept)
      .slice(0, 5);

    const weaknesses = skillEntries
      .filter(([, level]) => level < 0.4)
      .map(([concept]) => concept)
      .slice(0, 5);

    // Generate recommendations
    const recommendations = this.generateRecommendations(model);

    // Calculate learning velocity
    const velocity = this.calculateLearningVelocity(model.performanceHistory);

    // Determine optimal study time
    const optimalTime = this.determineOptimalStudyTime(model.performanceHistory);

    return {
      strengths,
      weaknesses,
      recommendations,
      learningVelocity: velocity,
      optimalStudyTime: optimalTime
    };
  }

  private generateRecommendations(model: PersonalizationModel): string[] {
    const recommendations: string[] = [];

    // Based on learning style
    if (model.learningStyle === 'visual') {
      recommendations.push('Focus on diagram-rich content and visual explanations');
    } else if (model.learningStyle === 'kinesthetic') {
      recommendations.push('Prioritize hands-on exercises and interactive content');
    }

    // Based on performance patterns
    const recentAccuracy = this.calculateAverageAccuracy(model.performanceHistory.slice(-10));
    if (recentAccuracy < 0.6) {
      recommendations.push('Consider reviewing prerequisite concepts');
      recommendations.push('Take more frequent breaks during study sessions');
    } else if (recentAccuracy > 0.8) {
      recommendations.push('Ready to tackle more challenging material');
    }

    return recommendations;
  }

  private determineOptimalStudyTime(performanceHistory: PerformanceMetrics[]): string {
    if (performanceHistory.length === 0) return 'morning';

    // Analyze performance by hour of day
    const hourlyPerformance = new Map<number, number[]>();

    performanceHistory.forEach(p => {
      const hour = p.timestamp.getHours();
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, []);
      }
      hourlyPerformance.get(hour)!.push(p.accuracy);
    });

    let bestHour = 9;
    let bestPerformance = 0;

    hourlyPerformance.forEach((accuracies, hour) => {
      const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      if (avgAccuracy > bestPerformance) {
        bestPerformance = avgAccuracy;
        bestHour = hour;
      }
    });

    if (bestHour < 12) return 'morning';
    if (bestHour < 17) return 'afternoon';
    return 'evening';
  }
}
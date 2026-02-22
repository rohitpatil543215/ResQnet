import { Heart, ShieldCheck } from 'lucide-react';

export default function FirstAidCard({ instructions, type }) {
    const TypeLabels = {
        road_accident: '🚗 Road Accident',
        medical: '🏥 Medical Emergency',
        fire: '🔥 Fire Emergency',
        natural_disaster: '🌊 Natural Disaster',
        violence: '⚠️ Violence',
        other: '🆘 General Emergency',
    };

    return (
        <div className="card first-aid-card">
            <div className="first-aid-header">
                <Heart size={20} className="text-accent" />
                <h3>First Aid Guide</h3>
                <span className="first-aid-type">{TypeLabels[type] || type}</span>
            </div>
            <div className="first-aid-steps">
                {instructions?.map((inst) => (
                    <div key={inst.step} className="first-aid-step">
                        <div className="first-aid-step-num">{inst.step}</div>
                        <div>
                            <p className="first-aid-step-title">{inst.title}</p>
                            <p className="first-aid-step-desc">{inst.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="first-aid-footer">
                <ShieldCheck size={14} />
                <span>Always call <strong>112</strong> for professional help</span>
            </div>
        </div>
    );
}

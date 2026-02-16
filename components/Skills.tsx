import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import skillsData from "@/data/skills.json";
import { skillsSchema } from "@/lib/schemas";

export default function Skills() {
    const skills = skillsSchema.parse(skillsData).skills;

    return (
        <section>
            <h2 className="title mb-8 text-2xl sm:text-3xl">skills</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {skills.map((category) => (
                    <Card key={category.category} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base">{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {category.items.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

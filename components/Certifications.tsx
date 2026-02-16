import { Badge } from "@/components/ui/Badge";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import certificationsData from "@/data/certifications.json";
import { certificationsSchema } from "@/lib/schemas";
import Link from "next/link";
import Icon from "./Icon";

export default function Certifications() {
    const certifications =
        certificationsSchema.parse(certificationsData).certifications;

    return (
        <section>
            <h2 className="title mb-8 text-2xl sm:text-3xl">certifications</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {certifications.map((cert, id) => (
                    <Card key={id} className="flex flex-col justify-between">
                        <CardHeader className="gap-2">
                            <CardTitle className="text-base">{cert.name}</CardTitle>
                            <CardDescription>{cert.description}</CardDescription>
                        </CardHeader>
                        {cert.href && (
                            <CardFooter>
                                <Link href={cert.href} target="_blank">
                                    <Badge variant="secondary" className="flex gap-2">
                                        {cert.icon && <Icon name={cert.icon} className="size-3" />}
                                        View
                                    </Badge>
                                </Link>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </section>
    );
}

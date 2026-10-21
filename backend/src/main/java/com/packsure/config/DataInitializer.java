package com.packsure.config;

import com.packsure.model.Rule;
import com.packsure.model.User;
import com.packsure.repository.RuleRepository;
import com.packsure.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed Users
        if (!userRepository.existsByUsername("officer")) {
            User officer = new User(
                "officer",
                passwordEncoder.encode("Officer@123"),
                "Anika Sharma",
                "ROLE_OFFICER",
                "LM-2026-0142",
                "Sector 21, Delhi"
            );
            userRepository.save(officer);
        }

        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                "admin",
                passwordEncoder.encode("Admin@123"),
                "P. Iyer",
                "ROLE_ADMIN",
                "LM-ADM-0001",
                "Headquarters, New Delhi"
            );
            userRepository.save(admin);
        }

        // 2. Seed Legal Metrology Packaged Commodities Rules 2011
        if (ruleRepository.count() == 0) {
            ruleRepository.save(new Rule(
                "PC-MRP-001",
                "Maximum Retail Price (MRP) Declaration",
                "The package must conspicuously display Maximum Retail Price inclusive of all taxes.",
                "ALL",
                "MRP",
                "PRESENCE",
                true,
                "HIGH",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(e)"
            ));

            ruleRepository.save(new Rule(
                "PC-NET-002",
                "Net Quantity Declaration",
                "The package must state net quantity in terms of standard units of weight, measure or number.",
                "ALL",
                "NET_QUANTITY",
                "PRESENCE",
                true,
                "HIGH",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(c)"
            ));

            ruleRepository.save(new Rule(
                "PC-MFG-003",
                "Manufacturer / Packer / Importer Details",
                "Name and complete address of the manufacturer, packer, or importer must be printed on the principal display panel.",
                "ALL",
                "MANUFACTURER",
                "PRESENCE",
                true,
                "HIGH",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(a)"
            ));

            ruleRepository.save(new Rule(
                "PC-DAT-004",
                "Date of Manufacture / Packing",
                "The month and year in which the commodity is manufactured or packed or imported must be mentioned.",
                "ALL",
                "MANUFACTURE_DATE",
                "PRESENCE",
                true,
                "MEDIUM",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(d)"
            ));

            ruleRepository.save(new Rule(
                "PC-CC-005",
                "Consumer Care Contact Details",
                "Name, address, telephone number, and email address of the person who can be contacted in case of consumer complaints.",
                "ALL",
                "CONSUMER_CARE",
                "FORMAT",
                true,
                "MEDIUM",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(da)"
            ));

            ruleRepository.save(new Rule(
                "PC-ORG-006",
                "Country of Origin",
                "Country of origin or manufacturer must be mentioned on imported and domestically packaged commodities.",
                "ALL",
                "COUNTRY_OF_ORIGIN",
                "PRESENCE",
                true,
                "MEDIUM",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(10)"
            ));

            ruleRepository.save(new Rule(
                "PC-NUM-007",
                "Retail Sale Price Validity",
                "MRP must be a positive numeric value in Indian Rupees (INR).",
                "ALL",
                "MRP",
                "NUMERIC",
                true,
                "HIGH",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(e)"
            ));

            ruleRepository.save(new Rule(
                "PC-EXP-008",
                "Expiry Date / Best Before Declaration",
                "The expiry date, use-by date or best before statement must be conspicuously declared on applicable commodities.",
                "ALL",
                "EXPIRY_DATE",
                "PRESENCE",
                false,
                "MEDIUM",
                "Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(d)"
            ));

            // Category-Specific Statutory Rules
            ruleRepository.save(new Rule(
                "PC-FOOD-010",
                "FSSAI License & Food Safety Declaration",
                "Packaged food commodities must declare FSSAI license number and food safety compliance mark.",
                "FOOD",
                "FSSAI_LICENSE",
                "PRESENCE",
                true,
                "HIGH",
                "Food Safety and Standards (Packaging and Labelling) Regulations"
            ));

            ruleRepository.save(new Rule(
                "PC-MED-020",
                "Pharmaceutical Active Ingredient & Schedule H Warning",
                "Medicinal and healthcare commodities must declare active ingredients and prescription warning statements.",
                "MEDICINES_HEALTHCARE",
                "ACTIVE_INGREDIENT",
                "PRESENCE",
                true,
                "HIGH",
                "Drugs and Cosmetics Act & PCR 2011"
            ));

            ruleRepository.save(new Rule(
                "PC-ELEC-030",
                "BIS Registration & Electrical Specifications",
                "Electronic goods must declare rated voltage, wattage, and BIS safety registration mark.",
                "ELECTRONICS",
                "BIS_REGISTRATION",
                "PRESENCE",
                true,
                "HIGH",
                "Electronics and IT Goods (Compulsory Registration) Order"
            ));

            ruleRepository.save(new Rule(
                "PC-COS-040",
                "Cosmetic Ingredients & Manufacturing License",
                "Cosmetic products must declare complete list of ingredients and cosmetics manufacturing license number.",
                "COSMETICS",
                "COSMETIC_INGREDIENTS",
                "PRESENCE",
                true,
                "MEDIUM",
                "Drugs and Cosmetics Rules - Part XV (Cosmetics)"
            ));
        }
    }
}

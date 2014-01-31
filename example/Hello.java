import java.lang.String;
import java.lang.System;

/**
 * Says hello.
 */
public final class Hello {
    public static void main(String[] args) {
        String name = "You";

        if (args.length >= 1) {
            name = args[0];
        }

        System.out.println("Hello " + name + "!");
    }
}
